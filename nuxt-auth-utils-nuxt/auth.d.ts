declare module "#auth-utils" {
	interface User {
		provider: string;
		name?: string;
		email?: string;
	}
}

export {};
