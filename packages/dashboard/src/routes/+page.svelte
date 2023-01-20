<script lang="ts">
    import { enhance } from "$app/forms";
    import FormInput from "$lib/components/FormInput.svelte";
    import Button from "$lib/components/Button.svelte";

    import type { ActionData } from "./$types";
    import Link from "$lib/components/Link.svelte";

    let screen: "login" | "register" | "forgot_password" = "login";
    export let form: ActionData;

    let showLoginError = false;
    let showRegisterError = false;
    let showRegisterSuccess = false;
    let showSendEmailError = false;
    let showSendEmailSuccess = false;

    $: showLoginError = form?.login?.error !== undefined;

    $: showRegisterError = form?.register?.error !== undefined
    $: showRegisterSuccess = form?.register?.success === true;

    $: showSendEmailError = form?.resendConfirmationEmail?.error !== undefined;
    $: showSendEmailSuccess = form?.resendConfirmationEmail?.success === true;

</script>

<div class="flex flex-col items-center justify-center h-screen">

    <div class="bg-zinc-900 border border-indigo-500/25 rounded-xl p-8 text-white w-1/3">

        {#if screen === "login"}
            <h1>Connexion</h1>
            <p>Connectez vous avec votre compte Nuster.</p>

            {#if showLoginError}
                <p class="text-red-500">
                    {form?.login?.error}
                </p>

                {#if form?.login?.error === "User not verified"}
                    <form action="?/resendConfirmationEmail" method="POST" use:enhance>
                        <input type="hidden" name="email" value={form?.login?.email ?? ""} />
                        <Button>Re envoyer le mail de confirmation</Button>
                    </form>
                {/if}
            {/if}

            {#if showRegisterSuccess}
                <p class="text-emerald-500">
                    Votre compte a été crée, vous allez recevoir un email pour finaliser votre inscription.
                </p>
            {/if}

            {#if showSendEmailError}
                <p class="text-red-500">L'email {form?.resendConfirmationEmail?.email} n'est pas associé à un compte Nuster.</p>
            {/if}

            {#if showSendEmailSuccess}
                <p class="text-emerald-500">L'email de vérification a bien été envoyé.</p>
            {/if}

            <form action="?/login" method="POST" class="flex flex-col gap-4 mt-8" use:enhance>
            
                <FormInput name="email" type="email" title="email" mandatory={true} placeholder="user@example.com" value={form?.login?.email ?? ""} autocomplete={"email"} />
                <FormInput name="password" type="password" title="Mot de passe" mandatory={true} autocomplete={"current-password"} />

                <div class="flex flex-row justify-between">
                    <div class="flex flex-row gap-2 items-center ml-2">
                        <input type="checkbox" name="remember" />
                        <span>Se rapeller de moi</span>
                    </div>
                    <Link on:click={() => screen = "forgot_password"}>Mot de passe oublié ?</Link>    
                </div>

                <div class="grid grid-cols-2 gap-6 mt-2">
                    <Button>Connexion</Button>
                    <Button role="secondary" on:click={() => screen = "register"}>Créer un compte</Button>
                </div>

            </form>
        {:else if screen === "register"}
            <h1>S'inscrire</h1>
            <p>Créer un compte Nuster.</p>

            {#if showRegisterError}
                <p class="text-red-500">
                    {form?.register?.error}
                </p>
            {/if}

            <form action="?/register" method="POST" class="flex flex-col gap-4 mt-8" use:enhance>

                <FormInput type="text" title="Nom d'utilisateur" name="username" value={form?.register?.username ?? ""} mandatory={true} autocomplete="nickname" />
                <FormInput type="email" title="Email" name="email" value={form?.register?.email ?? ""} mandatory={true} autocomplete="email" />
                <FormInput type="password" title="Mot de passe" name="password" mandatory={true} />
                <FormInput type="password" title="Confirmer le mot de passe" name="passwordConfirm" mandatory={true} />
            
                <div class="grid grid-cols-2 gap-6 mt-2">
                    <Button>Créer un compte</Button>
                    <Button role="secondary" on:click={() => screen = "login"}>Connexion</Button>
                </div>
            </form>

        {:else if screen == "forgot_password"}
            <h1>Mot de passe oublié</h1>
            <p>Vous avez oublié votre mot de passe ? Entrez votre email pour récupérer votre compte.</p>

            <form action="?/forgotPassword" method="POST" class="flex flex-col gap-4 mt-8" use:enhance>

                <FormInput type="email" title="email" name="email" autocomplete="email" mandatory={true} />

                <div class="grid grid-cols-2 gap-6 mt-2">
                    <Button>Envoyer</Button>
                    <Button role="secondary" on:click={() => screen = "login"}>Connexion</Button>
                </div>
            </form>
        {/if}
    </div>
</div>