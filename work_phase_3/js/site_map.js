/**
 * IMPORTS
 * Keep track of external modules being used
 * */
import { initAccordion } from "./modules/accordion.js";

/**
 * CONSTANTS
 * Define values that don't change e.g. page titles, URLs, etc.
 * */
const ACCORDION_ID = "site-map-accordion";

/**
 * VARIABLES
 * Define values that will change e.g. user inputs, counters, etc.
 * */

/**
 * FUNCTIONS
 * Group code into functions to make it reusable
 * */
function initPage() {
    initAccordion(ACCORDION_ID);
}

/**
 * EVENT LISTENERS
 * The code that runs when a user interacts with the page
 * */

// when the page fully loads
document.addEventListener("DOMContentLoaded", initPage);
