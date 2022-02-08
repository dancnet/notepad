<script>
    export let auth;
    let show = false;

    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    // Modal
    import Modal from './Modal.svelte';
    let error = null;

    // Script that adds category to the database.
    let name = "";
    const addCategory = () => {
        error = null;
        fetch(`/u/${auth.username}/categories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...auth.genHeader()
            },
            body: JSON.stringify({
                name
            })
        })
        .then(response => response.json())
        .then(data => {
            if(data.error) error = data.error;
            else {
                dispatch('newCategory', {
                    id: data.lastInsertRowid,
                    name,
                    open: false,
                    notes: []
                });
                show = false;
            }
        });
    }
</script>

<a href={"#"} class="w3-bar-item w3-button w3-hover-text-dark-grey w3-tooltip" on:click|preventDefault={() => show=true}>
    <i class="fa fa-folder-plus" />
    <span class="w3-text"> Add new category</span>
</a>

{#if show}
    <Modal title="Add new category" {error} on:close={() => show = false}>
        <form on:submit|preventDefault={addCategory}>
            <label for="name" class="w3-text-dark-grey">Category name:</label>
            <input bind:value={name} id="name" class="w3-input w3-border w3-margin-bottom" type="text" required>
            <button class="w3-button w3-purple" type="submit">Add</button>
        </form>
    </Modal>
{/if}