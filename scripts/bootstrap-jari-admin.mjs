import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");

if (!url) throw new Error("Puuttuva ympäristömuuttuja: SUPABASE_URL");
if (!secretKey) throw new Error("Puuttuva ympäristömuuttuja: SUPABASE_SECRET_KEY");
if (!email) throw new Error("Puuttuva ympäristömuuttuja: ADMIN_EMAIL");
if (!siteUrl) throw new Error("Puuttuva ympäristömuuttuja: NEXT_PUBLIC_SITE_URL");

const supabase = createClient(url, secretKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const redirectTo = `${siteUrl}/admin/reset-password`;

let userId = null;
let invited = false;

const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers({
  page: 1,
  perPage: 1000,
});
if (usersError) throw usersError;

const existing = usersData.users.find(
  (user) => user.email?.toLowerCase() === email,
);

if (existing) {
  userId = existing.id;
} else {
  const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
    redirectTo,
    data: { display_name: "Jari Koskela", role: "owner" },
  });
  if (error) throw error;
  userId = data.user.id;
  invited = true;
}

const { error: profileError } = await supabase.from("jkp_admin_users").upsert(
  {
    user_id: userId,
    display_name: "Jari Koskela",
    role: "owner",
    active: true,
  },
  { onConflict: "user_id" },
);
if (profileError) throw profileError;

console.log(JSON.stringify({
  ok: true,
  email,
  userId,
  invited,
  message: invited
    ? "Jarin kutsu lähetettiin. Salasana asetetaan sähköpostin palautuslinkistä."
    : "Jarin olemassa oleva käyttäjä aktivoitiin JKP Hallinnan pääkäyttäjäksi.",
}, null, 2));
