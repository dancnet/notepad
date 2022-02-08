<script>
    export let auth, connections, readonly = false;

    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    import AddNewCategory from './Parts/AddNewCategory.svelte';
    import Sharing from './Parts/Sharing.svelte';
</script>

<div class="w3-bar w3-card w3-light-grey w3-text-dark-grey">
    <a href={"#"} class="w3-bar-item w3-button w3-hover-text-dark-grey" on:click|preventDefault={() => dispatch('toggleSidebar')}>&#9776;</a>
    {#if readonly === false}
        <AddNewCategory {auth} on:newCategory />
    {/if}
    <Sharing {auth} {connections} on:updateConnections />
    <a href={"#"} on:click|preventDefault={() => alert('Feature not available yet.')} class="w3-bar-item w3-button w3-hover-text-dark-grey w3-tooltip">
        <i class="fa fa-user-cog" />
        <span class="w3-text"> Manage your account</span>
    </a>
    <a href="/" class="w3-bar-item w3-button w3-hover-text-dark-grey w3-right w3-tooltip">
        <i class="fa fa-sign-out-alt" />
        <span class="w3-text"> Logout</span>
    </a>
</div>