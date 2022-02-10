<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    // Modal
    import Modal from './Modal.svelte';
    let error = null, show = false;

    export let auth, category;
    let name = "";
    const addNote = () => {
        error = null;
        fetch(`/u/${auth.username}/notes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...auth.genHeader()
            },
            body: JSON.stringify({
                name,
                category: category.id
            })
        })
        .then(response => response.json())
        .then(data => {
            if(data.error) error = data.error;
            else {
                dispatch('newNote', {
                    note: {
                        id: data.lastInsertRowid,
                        name,
                        share: []
                    },
                    category
                });
                show = false;
            }
        });
    }
</script>

<a href={"#"} on:click|preventDefault={() => show = true} class="w3-right w3-hover-text-purple padding-side"><i class="far fa-plus-square" /></a>
{#if show}
    <Modal title="Add new note" {error} on:close = {() => show = false}>
        <form on:submit|preventDefault={addNote}>
            <label for="name" class="w3-text-dark-grey">Note name:</label>
            <input bind:value={name} id="name" class="w3-input w3-border w3-margin-bottom" type="text" required>
            <button class="w3-button w3-purple" type="submit">Add</button>
        </form>
    </Modal>
{/if}

<style>
    .padding-side{
        padding: 0 5px;
    }
</style>