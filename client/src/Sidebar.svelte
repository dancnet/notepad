<script>
    export let auth, connections, sidebarOpen, notepad, note, loading = false;

    let activeNotepad = '1', prefix = `/u/${auth.username}`;
    $: {
        if(activeNotepad === '1') {
            dispatch('readonly', false);
            auth.conn = null;
        }
        else {
            dispatch('readonly', true)
            auth.conn = connections.find(c => c.id === activeNotepad);
        };
        dispatch('hideEditor');
        getNotes();
    }

    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    // Edit note
    import EditNote from './Parts/EditNote.svelte';
    const noteEdited = (e, catId) => {
        let notes = notepad.find(n => n.id === catId).notes;
        notes[notes.findIndex(n => n.id === e.detail.id)] = e.detail;
        notepad = [...notepad];
    }

    // AddNewNote
    import AddNewNote from './Parts/AddNewNote.svelte';
    const newNote = e => {
        // Appends the new note that's been just added to the list.
        notepad.find(category => category.id === e.detail.category.id).notes.push(e.detail.note);
        notepad = [...notepad];
    }
    
    const getNotes = () => {
        loading = true;
        fetch(`${auth.genPrefix()}/categoriesAndNotes`, {
            headers: {...auth.genHeader()}
        })
        .then(response => response.json())
        .then(data => {
            let catId = null;
            let n = [];
            data.forEach(row => {
                if(row.categoryId !== catId) {
                    n.push({
                        id: row.categoryId,
                        name: row.categoryName,
                        open: false,
                        notes: []
                    });
                    catId = row.categoryId;
                }
                if(row.noteId !== null) {
                    n[n.length-1].notes.push({
                        id: row.noteId,
                        name: row.noteName,
                        share: row.share === null || row.share === undefined ? [] : row.share.split(',').map(Number)
                    });
                }
            });
            dispatch('getNotes', n);
            loading = false;
        });
    }

    const toggleCategory = (category) => {
        if(category.notes.length > 0) {
            category.open = !category.open;
            notepad = [...notepad];
        }
    };

    const getUsers = ids => ids.map(id => connections.find(c => c.id === id).username).join(', ');
</script>

<div id="sidebar" class:sidebar={sidebarOpen} class="w3-sidebar w3-bar-block w3-card-4 w3-light-grey w3-hide">
    <select bind:value={activeNotepad} class="w3-select" name="option">
        <option value="1" selected>Your notepad</option>
        {#each connections as connection (connection.id)}
            <option value={connection.id}>{connection.username}'s notepad</option>
        {/each}
    </select>
    {#if loading}
        <div class="w3-center">
            <i class="fas fa-spinner fa-pulse" />
        </div>
    {/if}
    {#each notepad as category (category.id)}
        <div class="w3-card category-wrap">
            <div class="w3-bar-item w3-tooltip category" on:click|self={() => toggleCategory(category)}>
                {category.name}
                {#if category.notes.length > 0}
                    <i class="fa {category.open ? 'fa-caret-up' : 'fa-caret-down'}" />
                {/if}
                {#if activeNotepad === '1'}
                    <a href={"#"} on:click|preventDefault={() => alert('Feature not available yet.')} class="w3-right w3-hover-text-purple padding-side"><i class="far fa-edit" /></a>
                    <AddNewNote {auth} {category} on:newNote={newNote} />
                {/if}
            </div>
            <div class="w3-white" class:w3-hide={!category.open}>
                {#each category.notes as Note (Note.id)}
                    <div on:click={() => dispatch('loadNote', Note)} class="w3-bar-item w3-button note">
                        <span class:active={Note === note}>{Note.name}</span>
                        {#if Note.share.length > 0}
                            <span class="w3-tooltip">
                                <span class="w3-badge w3-teal">
                                    {Note.share.length}
                                </span>
                                <span class="w3-text">
                                    {getUsers(Note.share)}
                                </span>
                            </span>
                        {/if}
                        {#if activeNotepad === '1'}
                            <EditNote {auth} {connections} note={Note} on:edited={e => noteEdited(e, category.id)} />
                        {/if}
                    </div>
                {/each}
            </div>
        </div>
    {:else}
        No categories have been found.
    {/each}
</div>

<style>
    #sidebar.sidebar {
        display: block !important;
        width: 300px;
    }
    .category {
        padding-right: 5px !important;
        user-select: none;
    }
    .category-wrap {
        margin: 3px 3px;
    }
    .note {
        padding-right: 10px !important;
    }
    .active {
        font-weight: bold;
    }
    .padding-side{
        padding: 0 5px;
    }
    select {
        outline: none;
    }
    .w3-badge {
        opacity: 0.5
    }
</style>