<script>
    import '../app.css';
    import Navbar from '$lib/components/Navbar.svelte';
    import { auth } from '$lib/stores/auth';
    import { onMount } from 'svelte';

    onMount(() => {
        auth.init();
    });
</script>

<Navbar />

<slot />