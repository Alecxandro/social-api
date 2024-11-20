<script>
    import { createEventDispatcher } from 'svelte';
    import { user } from '$lib/stores/auth';

    const dispatch = createEventDispatcher();

    let content = '';
    let loading = false;
    let error = null;

    async function handleSubmit() {
        if (!content.trim()) return;
        
        loading = true;
        error = null;

        try {
            const response = await fetch('http://localhost:5000/api/posts/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${$user?.token}`
                },
                body: JSON.stringify({ content }),
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to create post');
            }

            content = '';
            dispatch('postCreated');
            
        } catch (err) {
            error = err.message;
        } finally {
            loading = false;
        }
    }

    function handleCancel() {
        content = '';
        dispatch('postCreated');
    }
</script>

<div class="card">
    <div class="card-content">
        {#if error}
            <div class="notification is-danger is-light mb-4">
                {error}
            </div>
        {/if}

        <form on:submit|preventDefault={handleSubmit}>
            <div class="field">
                <div class="control">
                    <textarea
                        class="textarea"
                        placeholder="What's on your mind?"
                        bind:value={content}
                        rows="3"
                    ></textarea>
                </div>
            </div>

            <div class="field is-grouped">
                <div class="control">
                    <button 
                        type="submit" 
                        class="button is-primary {loading ? 'is-loading' : ''}"
                        disabled={loading || !content.trim()}
                    >
                        Post
                    </button>
                </div>
                <div class="control">
                    <button 
                        type="button" 
                        class="button"
                        on:click={handleCancel}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </form>
    </div>
</div>