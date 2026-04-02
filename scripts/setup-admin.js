const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.ADMIN_EMAIL || "email.nutty@gmail.com";
const adminPassword = "LeverageMa1L456789++";

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupAdmin() {
  console.log(`🚀 Setting up Admin User: ${adminEmail}...`);

  // 1. Try to create the user
  const { data: createdUser, error: createError } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true
  });

  if (createError) {
    if (createError.message.includes("already exists") || createError.message.includes("registered")) {
      console.log("ℹ️ User already exists. Updating password instead...");
      
      const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
      const user = users.find(u => u.email === adminEmail);
      
      if (user) {
        const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
          password: adminPassword
        });
        if (updateError) throw updateError;
        console.log("✅ Admin password updated successfully!");
      } else {
        throw new Error("Could not find existing user to update.");
      }
    } else {
      throw createError;
    }
  } else {
    console.log("✅ Admin user created successfully!");
  }

  process.exit(0);
}

setupAdmin().catch(err => {
  console.error("❌ Setup failed:", err.message);
  process.exit(1);
});
