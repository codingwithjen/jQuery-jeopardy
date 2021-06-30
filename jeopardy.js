const NUM_CATEGORIES = 6;
const NUM_QUESTIONS_PER_CAT = 5;
let categories = [];



// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {
    const response = await axios.get("http://jservice.io/api/categories", { params: { count: 100, offset: Math.floor(Math.random() * 100) }
});
    const catIds = [];
    for (let category of response.data) {
        catIds.push(category.id);
    }
    return _.sampleSize(catIds, NUM_CATEGORIES);
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
    const response = await axios.get(`http://jservice.io/api/category?id=${catId}`);
    const title = response.data.title;
    const clues = response.data.clues;
    return { catId, title, clues};
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */


async function fillTable() {
    $("#gameboard thead").empty(); // Top Header
    let $tr = $("<tr>");
    for (let iCat = 0; iCat < NUM_CATEGORIES; iCat++) {
        $tr.append($("<th>").text(categories[iCat].title));
    }
    $("#gameboard thead").append($tr);

    // Add the rows for the questions/clues for each category

    $("#gameboard tbody").empty();
    for (let jClue = 0; jClue < NUM_QUESTIONS_PER_CAT; jClue++) {
        let $tr = $("<tr>");
        for (let iCat = 0; iCat < NUM_CATEGORIES; iCat++) {
            $tr.append($("<td>").attr("id", `${iCat}-${jClue}`).text("?"));
        }
        $("#gameboard tbody").append($tr);
    }
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

async function handleClick(evt) {
// flips the "?" to show clue/question
    let id = evt.target.id;
    let [catId, clueId] = id.split("-");
    let clue = categories[catId].clues[clueId];

    let alert;

    if (!clue.showing) {
        alert = clue.question;
        clue.showing = "question";
    } else if (clue.showing === "question") {
        alert = clue.answer;
        clue.showing = "answer";
    } else {
        return
    }
    $(`#${catId}-${clueId}`).html(alert);
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {

}

// /** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {

}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
    let catIds = await getCategoryIds();

    for (let catId of catIds) {
        categories.push(await getCategory(catId));
    }
    setTimeout(() => {
        fillTable(categories);
    }, 100);
}

/** On click of restart button, restart game. */

$("#restart").on("click", function () {
    location.reload();
  });
  
  /** On page load, setup and start & add event handler for clicking clues */
  
  setupAndStart();
  $("tbody").on("click", "td", handleClick);