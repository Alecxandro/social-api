<script>
    import { auth } from '$lib/stores/auth';
    
    let email = '';
    let password = '';
    let error = '';
    let loading = false;

    async function handleLogin(e) {
        e.preventDefault();
        loading = true;
        error = '';

        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password }),
                credentials: 'include'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            auth.login(data);
            window.location.href = '/timeline';
            
        } catch (err) {
            error = err.message;
        } finally {
            loading = false;
        }
    }
</script>

<section class="section">
    <div class="container">
        <div class="columns is-centered">
            <div class="column is-4">
                <div class="box">
                    <h1 class="title has-text-centered">Login</h1>

                    {#if error}
                        <div class="notification is-danger is-light">
                            {error}
                        </div>
                    {/if}

                    <form on:submit={handleLogin}>
                        <div class="field">
                            <label class="label" for="email">Email</label>
                            <div class="control">
                                <input
                                    class="input"
                                    type="email"
                                    id="email"
                                    bind:value={email}
                                    required
                                />
                            </div>
                        </div>

                        <div class="field">
                            <label class="label" for="password">Password</label>
                            <div class="control">
                                <input
                                    class="input"
                                    type="password"
                                    id="password"
                                    bind:value={password}
                                    required
                                />
                            </div>
                        </div>

                        <div class="field">
                            <div class="control">
                                <button 
                                    class="button is-primary is-fullwidth {loading ? 'is-loading' : ''}" 
                                    type="submit"
                                    disabled={loading}
                                >
                                    Login
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</section>