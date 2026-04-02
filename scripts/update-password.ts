import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.ADMIN_EMAIL || "email.nutty@gmail.com";
const newPassword = "NuttyLeverage456!";

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function updatePassword() {
  console.log(`🚀 Updating password for: ${adminEmail}...`);

  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) throw listError;
  
  const user = users.find(u => u.email === adminEmail);
  
  if (user) {
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      password: newPassword
    });
    if (updateError) throw updateError;
    console.log(`✅ Admin password for ${adminEmail} updated successfully to: ${newPassword}`);
  } else {
    throw new Error("Could not find existing user to update.");
  }
}

updatePassword().catch(err => {
  console.error("❌ Setup failed:", err.message);
  process.exit(1);
});
