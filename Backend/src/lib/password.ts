import crypto from "crypto";

export function generateRandomPassword(length:number=10):string{
    const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const lower = "abcdefghijkmnopqrstuvwxyz";
    const numbers = "23456789";
    const symbols = "@#$&*!";
    const allChars = upper + lower + numbers + symbols;
    
    let password="";
    password += upper[crypto.randomInt(0, upper.length)];
    password += lower[crypto.randomInt(0, lower.length)];
    password += numbers[crypto.randomInt(0, numbers.length)];
    password += symbols[crypto.randomInt(0, symbols.length)];

    for (let i = 4; i < length; i++) {
        password += allChars[crypto.randomInt(0, allChars.length)];
    }

    // Shuffle the assembled password
    return password
        .split("")
        .sort(() => 0.5 - Math.random())
        .join("");
}