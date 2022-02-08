<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    import Modal from './Modal.svelte';
    let error = null, show = false;

    import Sharing_Connection from './Sharing_Connection.svelte';
    const setError = e => error = e.detail;
    const removed = e => dispatch('updateConnections', connections.filter(connection => connection.id !== e.detail));
    const updateConnection = e => {
        connections[connections.findIndex(c => c.id === e.detail.id)] = e.detail;
        dispatch('updateConnections', connections);
    }

    export let auth, connections;
    const genNewConn = () => {return {username: '', password: Math.random().toString(36).slice(2), site: ''}};
    let d = genNewConn();

    const add = () => {
        error = null;
        fetch(`/u/${auth.username}/auth`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...auth.genHeader()
            },
            body: JSON.stringify({
                ...d
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) error = data.error;
            else {
                connections.push({id: data.lastInsertRowid, ...d});
                dispatch('updateConnections', connections);
                d = genNewConn();
            }
        });
    };
</script>

<a href={"#"} on:click|preventDefault={() => show = true} class="w3-bar-item w3-button w3-hover-text-dark-grey w3-tooltip">
    <i class="fa fa-user-friends" />
    <span class="w3-text"> Sharing center</span>
</a>
{#if show}
    <Modal title="Sharing center" {error} on:close={() => show = false}>
        <table class="w3-table-all">
            <thead>
                <tr>
                    <th>Username</th>
                    <th>Site</th>
                    <th>Shared Password</th>
                    <th></th>
                </tr>
            </thead>
            {#each connections as connection (connection.id)}
                <Sharing_Connection {auth} {connection} on:setError={setError} on:removed={removed} on:updateConnection={updateConnection} />
            {/each}
            <tr>
                <td><input form="form" type="text" class="w3-input w3-border-purple" bind:value={d.username} required></td>
                <td><input form="form" type="text" class="w3-input w3-border-purple" bind:value={d.site} required></td>
                <td><input form="form" type="text" class="w3-input w3-border-purple" bind:value={d.password} required></td>
                <td><button form="form" class="w3-button w3-hover-text-purple"><i class="far fa-plus-square" /></button></td>
            </tr>
        </table>
        <form id="form" on:submit|preventDefault={add}></form>
    </Modal>
{/if}

<style>
    .w3-hover-text-purple.w3-button:hover {
        background: none !important;
    }
</style>