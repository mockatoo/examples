for (const button of document.querySelectorAll("form button")) {
	const label = button.innerHTML;
	button.form.addEventListener("submit", () => {
		button.disabled = true;
		button.textContent = "Please wait…";
	});
	window.addEventListener("pageshow", () => {
		button.disabled = false;
		button.innerHTML = label;
	});
}
