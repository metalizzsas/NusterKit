import { type Actions, redirect } from "@sveltejs/kit";

export const actions: Actions = {
    
    login: async ({ request, locals }) => {

        const form = await request.formData();

        const email = form.get("email")?.toString();
        const password = form.get("password")?.toString();

        if(email === undefined || password === undefined)
        {
            return {
                login: {
                    error: "Email or password cannot be empty",
                    email: email ?? ""
                }
            }
        }

        try
        {
            const user = await locals.pb.collection('users').authWithPassword(email, password);

            if(user.record.verified === false)
                return {
                    login: {
                        error: "User not verified",
                        email: email
                    }
                }
        }
        catch(ex)
        {
            console.log(ex);
            return {
                login: {
                    error: "Wrong username or password",
                    email: email
                }
            }
        }

        throw redirect(303, '/app');
    },
    register: async ({ request, locals }) => {

        const form = await request.formData();
        const email = form.get("email")?.toString();
        const username = form.get("username")?.toString();
        form.set("role", "user");

        try
        {
            if(email === undefined)
                throw "no email";

            await locals.pb.collection("users").create(form);
            await locals.pb.collection("users").requestVerification(email);
        }
        catch(ex)
        {
            return {
                register: {
                    error: "Failed to create the account",
                    email: email,
                    username: username
                }
            }
        }

        return {
            register: {
                success: true
            }
        }
    },
    forgotPassword: async ({ request, locals }) => {

        const form = await request.formData();
        const email = form.get("email")?.toString();

        if(email)
        {
            try
            {
                await locals.pb.collection("users").requestPasswordReset(email);

                return {
                    forgotPassword: {
                        success: true
                    }
                }
            }
            catch(ex)
            {
                console.log(ex);
                return {
                    forgotPassword: {
                        error: "Failed to send email"
                    }
                }
            }
        }
        
        return {
            forgotPassword: {
                error: "email not provided"
            }
        }
    },
    resendConfirmationEmail: async ({ request, locals }) => {
        const form = await request.formData();
        const email = form.get("email")?.toString();

        try
        {
            if(email === undefined)
                throw "Failed to find email";
            
            await locals.pb.collection("users").requestVerification(email);

            return {
                resendConfirmationEmail: {
                    success: true
                }
            }
        }
        catch(ex)
        {
            console.log(ex);
            return {
                resendConfirmationEmail: {
                    error: "Failed to send email verifiation",
                    email: email
                }
            }
        }
    }
};