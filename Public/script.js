document.addEventListener("DOMContentLoaded", () => {

    // ✅ SIGNUP HANDLER
    const signupForm = document.getElementById("signup-form");
    if (signupForm) {
        signupForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W]).{8,}$/;
            let isValid = true;

            signupForm.querySelectorAll("small").forEach(small => small.textContent = "");

            signupForm.querySelectorAll("input:not([type='checkbox'])").forEach(input => {
                const small = input.parentElement.querySelector("small");
                if (!input.value.trim() && small) {
                    small.textContent = "You should fill this";
                    small.style.color = "red";
                    isValid = false;
                }
            });

            const termsCheckbox = document.getElementById("terms");
            if (termsCheckbox && !termsCheckbox.checked) {
                const small = termsCheckbox.parentElement.querySelector("small");
                if (small) small.textContent = "You must accept the terms";
                isValid = false;
            }

            const password = document.getElementById("password");
            const confirmPassword = document.getElementById("confirm-password");

            if (!passwordPattern.test(password.value)) {
                const small = password.parentElement.querySelector("small");
                if (small) {
                    small.textContent = "Password must have at least 8 chars, 1 uppercase, 1 lowercase, 1 special char";
                    small.style.color = "red";
                }
                isValid = false;
            }

            if (password.value !== confirmPassword.value) {
                const small = confirmPassword.parentElement.querySelector("small");
                if (small) {
                    small.textContent = "Passwords do not match";
                    small.style.color = "red";
                }
                isValid = false;
            }

            if (isValid) {
                const formData = {
                    fullName: document.getElementById('full-name').value.trim(),
                    phoneNumber: document.getElementById('phone-number').value.trim(),
                    email: document.getElementById('email').value.trim(),
                    password: password.value
                };

                try {
                    const response = await fetch('/submit-form', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(formData)
                    });

                    const data = await response.json();
                    if (response.ok) {
                        alert('Signup successful! Redirecting to signin page.');
                        signupForm.reset();
                        window.location.href = "signin.html";
                    } else {
                        alert(`Error: ${data.message}`);
                    }
                } catch (error) {
                    alert('Error submitting form. Try again.');
                    console.error(error);
                }
            }
        });
    }

    // ✅ SIGNIN HANDLER
    const signinForm = document.getElementById("signin-form");
    if (signinForm) {
        signinForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            signinForm.querySelectorAll("small").forEach(small => small.textContent = "");

            const emailInput = document.getElementById("email");
            const passwordInput = document.getElementById("password");

            const email = emailInput?.value.trim();
            const password = passwordInput?.value.trim();

            if (!email || !password) {
                if (!email && emailInput) {
                    const small = emailInput.nextElementSibling;
                    if (small) small.textContent = "Email required";
                }
                if (!password && passwordInput) {
                    const small = passwordInput.nextElementSibling;
                    if (small) small.textContent = "Password required";
                }
                return;
            }

            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    alert("Login successful! Redirecting...");
                    window.location.href = "index.html";
                } else {
                    if (data.message.includes('Email')) {
                        const small = emailInput?.nextElementSibling;
                        if (small) small.textContent = data.message;
                    } else if (data.message.includes('password')) {
                        const small = passwordInput?.nextElementSibling;
                        if (small) small.textContent = data.message;
                    } else {
                        alert(`Error: ${data.message}`);
                    }
                }
            } catch (error) {
                alert("Error logging in. Try again.");
                console.error(error);
            }
        });
    }

    document.getElementById("forgot-password-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("forgot-email").value.trim();
    
        const response = await fetch('/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
    
        const data = await response.json();
        document.querySelector(".forgotpasserror-message").innerText = data.message;
    
        if (response.ok) {
            document.getElementById("forgotpassotp-form").style.display = "block";
        }
    });
    // ✅ RESET PASSWORD HANDLER (ENTER OTP AND NEW PASSWORD)
    document.getElementById("forgotpassotp-form").addEventListener("submit", async (e) => {
        e.preventDefault();

        const otp = document.getElementById("forgotpassotp").value.trim();
        const newPassword = document.getElementById("forgotpassandnew-password").value.trim();
        const email = document.getElementById("forgot-email").value.trim();

        const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W]).{8,}$/;
        if (!passwordPattern.test(newPassword)) {
            const small = document.querySelector(".forgotpasserror-message");
            small.textContent = "Password must have at least 8 characters, 1 uppercase, 1 lowercase, and 1 special character.";
            small.style.color = "red";
            return;
        }

        try {
            const response = await fetch('/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, newPassword })
            });

            const data = await response.json();

            const small = document.querySelector(".forgotpasserror-message");
            small.textContent = data.message;
            small.style.color = response.ok ? "green" : "red";

            if (response.ok) {
                alert("Password successfully changed! Redirecting to signin page."); // Show alert message
                setTimeout(() => {
                    window.location.href = "signin.html"; // Redirect to signin page
                }, 2000);
            }
        } catch (error) {
            const small = document.querySelector(".forgotpasserror-message");
            small.textContent = "Error resetting password. Please try again.";
            small.style.color = "red";
            console.error(error);
        }
    });
});
