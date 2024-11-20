<script>
    import { onMount } from 'svelte';
    import { user } from '$lib/stores/auth';
    import CreatePost from '$lib/components/CreatePost.svelte';

    let posts = [];
    let loading = true;
    let error = null;

    async function fetchPosts() {
        try {
            const response = await fetch('http://localhost:5000/api/posts/timeline/all', {
                headers: {
                    'Authorization': `Bearer ${$user?.token}`
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch posts');
            }

            const data = await response.json();
            posts = data;
        } catch (err) {
            error = err.message;
        } finally {
            loading = false;
        }
    }

    onMount(() => {
        fetchPosts();
    });
</script>

<section class="section">
    <div class="container">
        <div class="columns is-centered">
            <div class="column is-8">
                {#if $user}
                    <CreatePost on:postCreated={fetchPosts}/>
                {/if}

                {#if loading}
                    <div class="has-text-centered">
                        <span class="icon is-large">
                            <i class="fas fa-spinner fa-pulse"></i>
                        </span>
                    </div>
                {:else if error}
                    <div class="notification is-danger">
                        {error}
                    </div>
                {:else if posts.length === 0}
                    <div class="has-text-centered">
                        <p class="is-size-4 has-text-grey">No posts yet</p>
                    </div>
                {:else}
                    {#each posts as post}
                        <div class="card mb-4">
                            <!-- ... rest of the post card code ... -->
                        </div>
                    {/each}
                {/if}
            </div>
        </div>
    </div>
</section>