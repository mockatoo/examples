export const providers = [
	{ id: "apple", name: "Apple", scope: "name email" },
	{ id: "google", name: "Google", scope: "openid profile email" },
	{ id: "github", name: "GitHub", scope: "read:user user:email" },
	{ id: "discord", name: "Discord", scope: "identify email" },
	{ id: "facebook", name: "Facebook", scope: "public_profile email" },
	{ id: "linkedin", name: "LinkedIn", scope: "openid profile email" },
	{
		id: "microsoft-entra-id",
		name: "Microsoft",
		scope: "openid profile email",
	},
	{ id: "twitter", name: "X", scope: "users.read tweet.read" },
] as const;
