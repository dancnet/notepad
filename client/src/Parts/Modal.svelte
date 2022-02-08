<script>
    export let title, error;

    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
</script>

<div class="w3-modal w3-show" on:click|self={() => dispatch('close')}>
    <div class="w3-modal-content w3-animate-top w3-card-4 w3-round-large">
        <header class="w3-container w3-purple">
            <h2>{title}</h2>
        </header>
        <div class="w3-padding">
            <slot />
        </div>
        {#if error !== null}
            <div class="w3-panel w3-red">
                {error}
            </div>
        {/if}
    </div>
</div>

<style>
    .w3-modal {
        backdrop-filter: blur(3px);
        background-color: rgba(100, 100, 100, 0.5); 
    }
    .w3-panel {
        margin: 0 !important;
    }
    .w3-modal-content {
        overflow: hidden;
    }
</style>