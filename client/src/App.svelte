<script>
    // Sidebar
    import Sidebar from './Sidebar.svelte';
    let notepad = []; // stores sidebar data
    let sidebarOpen = true;
    const loadNote = e => note = e.detail;
    let readonly;
    const readonlyToggle = e => readonly = e.detail;
    const getNotes = e => notepad = e.detail;

    // Topbar
    import Topar from './Topbar.svelte';
    const toggleSidebar = () => sidebarOpen = !sidebarOpen;
    const newCategory = e => {
        console.log(notepad);
        notepad = [...notepad, e.detail];
        console.log(notepad);
    }
    const updateConnections = e => connections = [...e.detail];

    // Editor
    import Editor from './Editor.svelte';    
    let note = null; // the note that is open in the editor
    const hideEditor = () => note = null;

    // Login
    import Login from './Login.svelte';
    let auth, connections;
    const loggedin = e => { 
        auth = e.detail.auth;
        connections = e.detail.connections;
    };
</script>

{#if auth === undefined}
    <Login on:loggedin={loggedin} />
{:else}
    <Sidebar {auth} {connections} {sidebarOpen} {notepad} {note} on:loadNote={loadNote} on:readonly={readonlyToggle} on:hideEditor={hideEditor} on:getNotes={getNotes} />

    <main class:sidebar={sidebarOpen}>
        <Topar {auth} {connections} {readonly} on:toggleSidebar={toggleSidebar} on:newCategory={newCategory} on:updateConnections={updateConnections} />
        {#if note !== null}
            <Editor {auth} {note} {readonly} />
        {/if}
    </main>
{/if}

<style>
    /* This class is appended when the sidebar is open. */
    main.sidebar {
        margin-left: 300px;
    }

    main {
        display: flex;
        flex-flow: column;
        height: 100vh;
    }
</style>