<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    let username = '', password = '', error=null;
    const login = () => {
        error = null;
        fetch(`/u/${username}/auth`, {
            headers: {
                auth: btoa(JSON.stringify({username: '', password}))
            }
        })
        .then(response => {
            if (response.ok) return response.json();
            else {
                error = 'Wrong credentials.';
                throw Error;
            }
        })
        .then(data => {
            const auth = {
                username,
                password,
                conn: null,
                genPrefix() {
                    return this.conn === null ? `/u/${this.username}` : `${this.conn.site}/u/${this.conn.username}`;
                },
                genHeader() {
                    return {auth: btoa(JSON.stringify({
                        username: this.conn === null ? '' : this.username,
                        password: this.conn === null ? this.password : this.conn.password}))
                    };
                }
            }
            dispatch('loggedin', {auth, connections: data});
        });
    }
</script>

<div class="wrap w3-light-grey">
    <div class="w3-card w3-white w3-round w3-animate-zoom">
        {#if error !== null}
            <div class="w3-panel w3-red">
                {error}
            </div>
        {/if}
        <form on:submit|preventDefault={login} class="w3-padding">
            <p>
                <label for="username" class="w3-text-purple"><b>Username</b></label>
                <input bind:value={username} id="username" class="w3-input w3-border" type="text" required>
            </p>
            <p>
                <label for="password" class="w3-text-purple"><b>Password</b></label>
                <input bind:value={password} id="password" class="w3-input w3-border" type="password" required>
            </p>
    
            <center>
                <button class="w3-btn w3-purple">Login</button>
            </center>
        </form>
    </div>
</div>

<style>
    .wrap {
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .w3-panel {
        margin: 0 !important;
        padding: 5px;
        text-align: center;
    }
</style>