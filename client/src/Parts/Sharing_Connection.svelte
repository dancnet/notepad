<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    export let auth, connection;

    let d, edit = false;
    const toggleEdit = () => {
        edit = !edit;
        dispatch('setError', null);
        if(edit) d = {...connection};
    }
    const save = () => {
        dispatch('setError', null);
        fetch(`/u/${auth.username}/auth/${connection.id}`, {
            method: 'PUT',
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
            if (data.error) dispatch('setError', data.error);
            else {
                dispatch('updateConnection', d);
                toggleEdit();
            }
        });
    }
    const remove = () => {
        fetch(`/u/${auth.username}/auth/${connection.id}`, {
            method: 'DELETE',
            headers: {
                ...auth.genHeader()
            }
        })
        .then(response => response.json())
        .then(data => {
            dispatch('removed', connection.id);
        });
    }
</script>

<tr on:dblclick={toggleEdit}>
    {#if edit}
        <td><input form={`form${connection.id}`} type="text" class="w3-input w3-border-purple" bind:value={d.username} required></td>
        <td><input form={`form${connection.id}`} type="text" class="w3-input w3-border-purple" bind:value={d.site} required></td>
        <td><input form={`form${connection.id}`} type="text" class="w3-input w3-border-purple" bind:value={d.password} required></td>
        <td><button form={`form${connection.id}`} class="w3-button w3-hover-text-purple"><i class="far fa-save" /></button></td>
    {:else}
        <td>{connection.username}</td>
        <td>{connection.site}</td>
        <td>*****</td>
        <td><button on:click={remove} class="small w3-button w3-hover-text-purple"><i class="far fa-trash-alt" /></button></td>
    {/if}
</tr>
<form on:submit|preventDefault={save} id={`form${connection.id}`} />

<style>
    .small {
        margin: 0;
        padding: 0 15px;
    }
    .w3-button:hover {
        background: none !important;
    }
</style>