const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function autoDeploy() {
    // Grabs a custom message if you provide one, otherwise uses the current timestamp
    const customMessage = process.argv[2];
    const message = customMessage ? customMessage : `Auto-deploy update: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`;

    console.log("⚙️ Staging files...");
    
    try {
        await execPromise('git add .');
        
        console.log(`📝 Committing: "${message}"`);
        await execPromise(`git commit -m "${message}"`);
        
        console.log("🚀 Pushing to origin main...");
        const { stdout } = await execPromise('git push origin main');
        
        console.log("✅ Push successful! Render is pulling the new code.");
        if (stdout) console.log(stdout);

    } catch (error) {
        // Prevent crashing if you run the script but haven't actually changed any code
        if (error.stdout && error.stdout.includes("nothing to commit")) {
            console.log("⚠️ No changes detected. Nothing to commit or push.");
        } else {
            console.error("❌ Deployment failed. Check your git connection:");
            console.error(error.message);
        }
    }
}

autoDeploy();
