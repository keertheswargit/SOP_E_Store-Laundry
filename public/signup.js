document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("signup-form");
  const usernameInput = document.getElementById("reg-username");
  const passwordInput = document.getElementById("reg-password");
  const confirmPasswordInput = document.getElementById("reg-confirm-password");
  const errorElement = document.getElementById("signup-error");
  const successElement = document.getElementById("signup-success");
  const submitBtn = document.getElementById("reg-submit-btn");

  const ruleLen = document.getElementById("rule-len");
  const ruleUpper = document.getElementById("rule-upper");
  const ruleLower = document.getElementById("rule-lower");
  const ruleNum = document.getElementById("rule-num");
  const ruleSpecial = document.getElementById("rule-special");
  const idCardInput = document.getElementById("reg-id-card");
  const fileStatus = document.getElementById("file-chosen-status");

  function evaluatePassword(pwd) {
    return {
      len: pwd.length >= 8,
      upper: /[A-Z]/.test(pwd),
      lower: /[a-z]/.test(pwd),
      num: /[0-9]/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    };
  }

  function updateRule(elem, isValid, text) {
    if (!elem) return;
    if (isValid) {
      elem.className = "valid";
      elem.innerHTML = `<span>✓</span> ${text}`;
    } else {
      elem.className = "invalid";
      elem.innerHTML = `<span>○</span> ${text}`;
    }
  }

  // Real-time password requirement checklist
  passwordInput.addEventListener("input", () => {
    const pwd = passwordInput.value;
    const checks = evaluatePassword(pwd);

    updateRule(ruleLen, checks.len, "At least 8 characters");
    updateRule(ruleUpper, checks.upper, "At least 1 uppercase letter (A-Z)");
    updateRule(ruleLower, checks.lower, "At least 1 lowercase letter (a-z)");
    updateRule(ruleNum, checks.num, "At least 1 number (0-9)");
    updateRule(ruleSpecial, checks.special, "At least 1 special character (!@#$%^&*...)");
  });

  // Identity card file chosen preview
  if (idCardInput && fileStatus) {
    idCardInput.addEventListener("change", () => {
      if (idCardInput.files && idCardInput.files[0]) {
        const file = idCardInput.files[0];
        fileStatus.className = "file-chosen-status";
        fileStatus.innerHTML = `📄 <strong>Selected ID:</strong> ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
        fileStatus.classList.remove("hidden");
      } else {
        fileStatus.classList.add("hidden");
      }
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorElement.textContent = "";
    successElement.textContent = "";

    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (!username) {
      errorElement.textContent = "Please enter a valid student username or roll number.";
      usernameInput.focus();
      return;
    }

    const checks = evaluatePassword(password);
    if (!checks.len || !checks.upper || !checks.lower || !checks.num || !checks.special) {
      errorElement.textContent = "Please ensure your password meets all strong password requirements.";
      passwordInput.focus();
      return;
    }

    if (password !== confirmPassword) {
      errorElement.textContent = "Passwords do not match. Please re-enter.";
      confirmPasswordInput.focus();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Registering...";

    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);
      formData.append("confirmPassword", confirmPassword);

      if (idCardInput && idCardInput.files && idCardInput.files[0]) {
        formData.append("idCard", idCardInput.files[0]);
      }

      const response = await fetch("/api/register", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        successElement.textContent = data.message || "Registration successful! Redirecting to login...";
        submitBtn.textContent = "Registered!";
        setTimeout(() => {
          window.location.href = "/index.html";
        }, 1500);
      } else {
        errorElement.textContent = data.message || "Registration failed. Please try again.";
        submitBtn.disabled = false;
        submitBtn.textContent = "Register Account";
      }
    } catch (err) {
      console.error("Registration error:", err);
      errorElement.textContent = "Network error: Unable to connect to server. Please try again later.";
      submitBtn.disabled = false;
      submitBtn.textContent = "Register Account";
    }
  });
});
