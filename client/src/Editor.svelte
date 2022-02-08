<script>
    let quill, timeout, previousContent, networkActivity = false, failedToSave = false, loading = false;
    
    // When the note variable changes, load new data into the editor.
    export let auth, note = null, readonly = false;
    $: {
        if(note !== null) {
            loading = true;
            fetch(`${auth.genPrefix()}/notes/${note.id}/content`, {
                headers: {...auth.genHeader()}
            })
            .then(response => response.json())
            .then(data => {
                console.log('Loaded');
                quill.off('text-change', save);
                quill.setContents(data);
                if (readonly) quill.disable();
                else {
                    quill.enable()
                    previousContent = quill.getContents();
                    quill.on('text-change', save);
                };
                loading = false;
            });
        }
    }

    // This function is automatically triggered when a user types.
    const save = (delta, oldDelta, source) => {
        if(timeout) clearTimeout(timeout);
        timeout = setTimeout(pushChanges,1000);
    }

    // Function triggered when failing to save.
    const failToSave = () => {
        failedToSave = true;
        networkActivity = false;
        if(timeout) clearTimeout(timeout);
        timeout = setTimeout(pushChanges,5000);
        console.error('Failed to save!');
    }

    // This is the function that actually saves the contents.
    const pushChanges = () => {
        // Try later if a connection is already in progress.
        if (networkActivity) {
            if(timeout) clearTimeout(timeout);
            timeout = setTimeout(pushChanges,1000);
        } else {
            // Calculate the differences compared to the last save.
            const content = quill.getContents();
            const diff = previousContent.diff(content);
            // Start communicating with the server.
            networkActivity = true;
            failedToSave = false;
            fetch(`/u/${auth.username}/notes/${note.id}/content`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...auth.genHeader()
                },
                body: JSON.stringify({
                    diff
                })
            })
            .then(response => {
                if(response.ok) {
                    // If everything is fine, set the saved content as previousContent, so that whatever the user typed while syncing is preserved.
                    failedToSave = false;
                    previousContent = content;
                    networkActivity = false;
                    console.log('Saved', diff.ops);
                } else failToSave();
            })
            .catch(() => failToSave());
        }
    }

    // Loads quill on mount.
    import { onMount } from 'svelte';
    onMount(() => {
        quill = new Quill('#editor', {
            modules: {
                toolbar: '#toolbar',
                syntax: true
            },
            placeholder: 'No content yet...',
            readOnly: false,
            theme: 'snow'
        });
    });
</script>

<div class="w3-content w3-section w3-border">
    <div id="toolbar" class:w3-hide={readonly}>
        <span class="ql-formats">
            <select class="ql-font"></select>
            <select class="ql-size"></select>
        </span>
        <span class="ql-formats">
            <button class="ql-bold"></button>
            <button class="ql-italic"></button>
            <button class="ql-underline"></button>
            <button class="ql-strike"></button>
        </span>
        <span class="ql-formats">
            <select class="ql-color"></select>
            <select class="ql-background"></select>
        </span>
        <span class="ql-formats">
            <button class="ql-script" value="sub"></button>
            <button class="ql-script" value="super"></button>
        </span>
        <span class="ql-formats">
            <button class="ql-header" value="1"></button>
            <button class="ql-header" value="2"></button>
            <button class="ql-blockquote"></button>
            <button class="ql-code-block"></button>
        </span>
        <span class="ql-formats">
            <button class="ql-list" value="ordered"></button>
            <button class="ql-list" value="bullet"></button>
            <button class="ql-indent" value="-1"></button>
            <button class="ql-indent" value="+1"></button>
        </span>
        <span class="ql-formats">
            <button class="ql-direction" value="rtl"></button>
            <select class="ql-align"></select>
        </span>
        <span class="ql-formats">
            <button class="ql-link"></button>
            <button class="ql-image"></button>
            <button class="ql-video"></button>
            <button class="ql-formula"></button>
        </span>
        <span class="ql-formats">
            <button class="ql-clean"></button>
        </span>
    </div>
    {#if loading}
        <div class="w3-center">
            <i class="fas fa-spinner fa-pulse" />
        </div>
    {/if}
    <div class:w3-hide={loading} id="editor" />
</div>

{#if networkActivity || failedToSave}
    <div class="sync" class:w3-text-red={failedToSave}>
        <i class="fas fa-spinner fa-pulse" />
    </div>
{/if}

<style>
    .sync {
        position: fixed;
        bottom: 5px;
        right: 5px;
        z-index: 2;
        font-size: x-large;
    }
</style>