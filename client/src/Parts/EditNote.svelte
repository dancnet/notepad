<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    // Modal
    import Modal from './Modal.svelte';
    let error = null, show = false, d;
    const modinit = () => d = {...note}
    $: if(show) modinit();

    export let auth, note, connections;
    const editNote = () => {
        error = null;
        fetch(`/u/${auth.username}/notes/${note.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...auth.genHeader()
                },
                body: JSON.stringify(d)
            })
            .then(response => response.json())
            .then(data => {
                if(data.error) error = data.error;
                else {
                    dispatch('edited', d)
                    show = false;
                }
            });
        }
</script>

<a href={"#"} on:click|preventDefault={() => show = true} class="w3-right w3-hover-text-purple"><i class="far fa-edit" /></a>
{#if show}
    <Modal title="Edit note properties" {error} on:close = {() => show = false}>
        <form on:submit|preventDefault={editNote}>
            <label for="name" class="w3-text-dark-grey">Note name:</label>
            <input bind:value={d.name} id="name" class="w3-input w3-border w3-margin-bottom" type="text" required>
            
            <label for="share">Share:</label>
            <select bind:value={d.share} class="w3-select w3-border" id="share" multiple>
                {#each connections as connection (connection.id)}
                    <option value={connection.id}>{connection.username}</option>
                {/each}
            </select>
            
            <button class="w3-button w3-purple" type="submit">Edit</button>
        </form>
    </Modal>
{/if}