<script>
    import { onMount } from 'svelte';
    import { user } from '$lib/stores/auth';
    import CreatePost from '$lib/components/CreatePost.svelte';

    let posts = [];
    let loading = true;
    let error = null;
    let showCreatePost = false;

    async function fetchPosts() {
        try {
            const response = await fetch('http://localhost:5000/api/timeline/all', {
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

    async function handleLike(postId) {
        try {
            const response = await fetch(`http://localhost:5000/api/posts/${postId}/like`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${$user?.token}`
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to like post');
            }

            // Update the posts array to reflect the like
            posts = posts.map(post => {
                if (post._id === postId) {
                    const isLiked = post.likes.includes($user?._id);
                    return {
                        ...post,
                        likes: isLiked 
                            ? post.likes.filter(id => id !== $user?._id)
                            : [...post.likes, $user?._id]
                    };
                }
                return post;
            });

        } catch (err) {
            console.error('Like error:', err);
        }
    }

    // Helper function to check if user has liked a post
    function hasLiked(post) {
        return post.likes.includes($user?._id);
    }

    function handlePostCreated() {
        showCreatePost = false;
        fetchPosts();
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
                    <div class="box mb-5">
                        {#if showCreatePost}
                            <CreatePost on:postCreated={handlePostCreated}/>
                        {:else}
                            <button 
                                class="button is-primary is-fullwidth"
                                on:click={() => showCreatePost = true}
                            >
                                Create New Post
                            </button>
                        {/if}
                    </div>
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
                            <div class="card-content">
                                <div class="media">
                                    <div class="media-left">
                                        <figure class="image is-48x48">
                                            <img 
                                                src={post.author?.profilePicture || 'https://bulma.io/images/placeholders/96x96.png'} 
                                                alt="Profile" 
                                                class="is-rounded"
                                            >
                                        </figure>
                                    </div>
                                    <div class="media-content">
                                        <p class="title is-4">{post.author?.username}</p>
                                        <p class="subtitle is-6 has-text-grey">
                                            {new Date(post.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                <div class="content">
                                    {post.content}
                                </div>

                                <div class="level is-mobile">
                                    <div class="level-left">
                                        <div class="level-item">
                                            <button 
                                                class="button {hasLiked(post) ? 'is-danger' : 'is-white'}"
                                                on:click={() => handleLike(post._id)}
                                                disabled={!$user}
                                            >
                                                <span class="icon">❤️</span>
                                                <span>{post.likes?.length || 0}</span>
                                            </button>
                                        </div>
                                        <div class="level-item">
                                            <button class="button is-white">
                                                <span class="icon">💬</span>
                                                <span>{post.comments?.length || 0}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    {/each}
                {/if}
            </div>
        </div>
    </div>
</section>