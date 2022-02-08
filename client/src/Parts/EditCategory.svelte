<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    // Modal
    import Modal from './Modal.svelte';
    let error = null, show = false;

    export let note;
    const editNote = () => {}
</script>
<a href={"#"} on:click|preventDefault={() => show = true} class="w3-right w3-hover-text-purple"><i class="far fa-edit" /></a>
{#if show}
    <Modal title="Add new note" {error} on:close = {() => show = false}>
        <form on:submit|preventDefault={editNote}>
            <label for="name" class="w3-text-dark-grey">Note name:</label>
            <input bind:value={note.name} id="name" class="w3-input w3-border w3-margin-bottom" type="text" required>
            <button class="w3-button w3-purple" type="submit">Edit</button>
        </form>
    </Modal>
{/if}