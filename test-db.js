require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data, error } = await supabase
    .from("doctors")
    .update({ is_active: false })
    .eq("id", "2a7e75e4-2c27-433d-944f-3a06ada7c3ea");
  console.log("Update Error:", error);
  
  const { data: fetch, error: fetchErr } = await supabase.from("doctors").select("id, is_active");
  console.log("Doctors after:", fetch);
}

run();
