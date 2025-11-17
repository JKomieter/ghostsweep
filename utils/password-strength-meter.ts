export function checkPasswordStrength(password: string) {
    let strength = 0;
    const feedback = [];

    // Check for length
    if (password.length < 8) {
        feedback.push("Password should be at least 8 characters long.");
    } else {
        strength += 1;
    }

    // Check for lowercase letters
    if (/[a-z]/.test(password)) {
        strength += 1;
    } else {
        feedback.push("Password should include lowercase letters.");
    }

    // Check for uppercase letters
    if (/[A-Z]/.test(password)) {
        strength += 1;
    } else {
        feedback.push("Password should include uppercase letters.");
    }

    // Check for numbers
    if (/[0-9]/.test(password)) {
        strength += 1;
    } else {
        feedback.push("Password should include numbers.");
    }

    // Check for special characters
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        strength += 1;
    } else {
        feedback.push("Password should include special characters.");
    }

    let strengthMessage;
    if (strength <= 2) {
        strengthMessage = "Weak";
    } else if (strength === 3) {
        strengthMessage = "Medium";
    } else if (strength >= 4) {
        strengthMessage = "Strong";
    }

    return {  strengthMessage, feedback: feedback, strength };
}

// Example usage:
// const result = checkPasswordStrength("MySecureP@ssw0rd");
// console.log(result); // { strength: "Strong", feedback: [] }