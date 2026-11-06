// Vector UI graphics never depend on a device emoji font.
function uiIcon(name,filled=false){
 const paths={heart:'M12 21 3.5 12.5C-2 6 6 0 12 6.5 18 0 26 6 20.5 12.5Z',star:'M12 2v20M2 12h20M5 5l14 14M19 5 5 19',check:'m4 12 5 5L20 6',plus:'M12 3v18M3 12h18'};
 return `<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="${filled?'currentColor':'none'}" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="${paths[name]??paths.star}"/></svg>`;
}
