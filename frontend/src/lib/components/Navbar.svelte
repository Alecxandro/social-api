<script>
    import { user, auth } from '$lib/stores/auth';
    import { onMount } from 'svelte';
    
    onMount(() => {
        // Mobile menu burger functionality
        const burger = document.querySelector('.navbar-burger');
        const menu = document.querySelector('.navbar-menu');
        
        burger?.addEventListener('click', () => {
            burger.classList.toggle('is-active');
            menu.classList.toggle('is-active');
        });
    });
</script>

<nav class="navbar is-light" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
        <a class="navbar-item" href="/">
            <strong>Social App</strong>
        </a>

        <a role="button" class="navbar-burger" aria-label="menu" aria-expanded="false">
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
        </a>
    </div>

    <div class="navbar-menu">
        <div class="navbar-end">
            {#if $user}
                <div class="navbar-item">
                    <span class="mr-2">Welcome, {$user.username}</span>
                </div>
                <div class="navbar-item">
                    <div class="buttons">
                        <button class="button is-light" on:click={auth.logout}>
                            Log out
                        </button>
                    </div>
                </div>
            {:else}
                <div class="navbar-item">
                    <div class="buttons">
                        <a href="/register" class="button is-primary">
                            <strong>Sign up</strong>
                        </a>
                        <a href="/login" class="button is-light">
                            Log in
                        </a>
                    </div>
                </div>
            {/if}
        </div>
    </div>
</nav>