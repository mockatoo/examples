import { randomUUID } from "node:crypto";
import nextEnv from "@next/env";
import { expect, type Page } from "@playwright/test";
import type { providers } from "../lib/providers";

nextEnv.loadEnvConfig(process.cwd());
const email = process.env.MOCK_EMAIL ?? "";
const password = process.env.MOCK_PASSWORD ?? "";

export function createAddress(tag = ""): string {
	if (!email || !password)
		throw new Error(
			"Set MOCK_EMAIL and MOCK_PASSWORD in .env.local or the environment.",
		);
	// An ordinary tag isolates each app account, including across repeated runs.
	return email.replace("@", `+e2e-${randomUUID()}${tag ? `.${tag}` : ""}@`);
}

type Provider = (typeof providers)[number]["name"];
type User = {
	id: string;
	email: string;
	emailVerified: boolean;
	name: string;
	image?: string | null;
};

export async function logIn(page: Page, provider: Provider, address: string) {
	await page.goto("/");
	await page.getByRole("button", { name: `Sign in with ${provider}` }).click();
	await page.getByLabel("Email", { exact: true }).fill(address);
	await page.getByLabel("Password", { exact: true }).fill(password);
	await page.getByRole("button", { name: "Log in with password" }).click();
}

export async function signIn(page: Page, provider: Provider, address: string) {
	await logIn(page, provider, address);
	await page.getByRole("button", { name: "Authorize" }).click();
}

export async function sessionUser(page: Page): Promise<User> {
	await expect(page.getByRole("heading", { name: "Your session" })).toBeVisible(
		{
			timeout: 15_000,
		},
	);
	// Read the session the app displays, without decoding cookies or provider tokens.
	return JSON.parse((await page.locator("pre code").textContent()) ?? "").user;
}

export async function signInError(page: Page, error: string, message: string) {
	await expect(page).toHaveURL(
		(url) => url.pathname === "/" && url.searchParams.get("error") === error,
	);
	await expect(page.getByRole("alert").filter({ hasText: message })).toHaveText(
		message,
	);
	await expect(
		page.getByRole("button", { name: "Sign in with Google" }),
	).toBeVisible();
	await expect(page.getByText("You are logged in")).toBeHidden();
}
