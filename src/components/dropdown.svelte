<script lang="ts">
	let menuOpen = $state(false);
	let inputValue = $state("");
	
    let {
        alternatives = [], // "About", "Base", "Blog", "Contact", "Custom"
        value = $bindable()
        //inputValue = $bindable()
    }: {
        alternatives: string[], value: string
    } = $props();

	let filteredItems: string[] = $state([]);
	
    inputValue = value;

	const handleInput = () => {
        const filtered = alternatives.filter(item => item.toLowerCase().match(inputValue.toLowerCase()));
        const exact = filtered.length === 1 && filtered[0].toLowerCase() == inputValue.toLowerCase();
        menuOpen = inputValue.length > 0 && !exact;

        value = inputValue;
		return filteredItems = filtered.length ? filtered : alternatives;
	}
    const clicked = (item: string) => {
        inputValue = item;
        handleInput();
    }
</script>

<section class="dropdown">
    <input type="text" placeholder="Search..." autocomplete="off" id="searchInput" bind:value={inputValue}
        oninput={handleInput} onclick={() => menuOpen = true}>
    <div id="myDropdown" class:show={menuOpen} class="dropdown-content">
        {#if filteredItems.length > 0}
            {#each filteredItems as item}
            <div onclick={() => clicked(item)}>{item}</div>
            {/each}
        {/if}
    </div>	
</section>

<style>		
    .dropdown {
      position: relative;
      display: inline-block;
    }
        
    .dropdown-content {
      display: none;
      position: absolute;
      background-color: #f6f6f6;
      min-width: 230px;
      border: 1px solid #ddd;
      z-index: 1;
    }
    
    .show {display:block;}	
</style>
