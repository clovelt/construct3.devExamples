// Import any other script files here, e.g.:
// import * as myModule from "./mymodule.js";

runOnStartup(async runtime => {
    // Code to run on the loading screen.
    // Note layouts, objects etc. are not yet available.

    runtime.addEventListener("beforeprojectstart", () => OnBeforeProjectStart(runtime));
});

async function OnBeforeProjectStart(runtime) {
    // Code to run just before 'On start of layout' on
    // the first layout. Loading has finished and initial
    // instances are created and available to use here.

    runtime.addEventListener("tick", () => Tick(runtime));
	
	//callApi(runtime);
	
	// Check if URL contains the parameter "&design=1"
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('design') && urlParams.get('design') === '1') {
        runtime.globalVars.footerDesign = "_d2";
    }
}

function Tick(runtime) {
    // Code to run every tick
    
}
export function callApi(runtime) {
    runtime.globalVars.spinning = 1;
	const url = "https://api.leprigold.crazymonkey.club/api/v1/spin";
    const params = {
        bet: runtime.globalVars.bet,
        session_uuid: runtime.globalVars.session_uuid,
        balance: runtime.globalVars.beforeBalance
    };

    fetch(url + '?' + new URLSearchParams(params))
        .then(response => response.json())
        .then(data => {
            updateTextObjects(runtime, data.spin.spin_elements);
            updateGlobalVariables(runtime, data);
			runtime.globalVars.spinning = 0;
			runtime.callFunction('SpinFinish');
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

function updateTextObjects(runtime, elements) {
    // Flatten the 2D array to a 1D array
    const flatElements = elements.flat();

    // Create an object to keep track of the counts of each element
    const elementCounts = {};
    flatElements.forEach(element => {
        elementCounts[element] = (elementCounts[element] || 0) + 1;
    });

    // Find the highest number that is repeated 3 times or more
    let highestRepeatedNumber = null;
    Object.keys(elementCounts).forEach(number => {
        if (elementCounts[number] >= 3) {
            const numericValue = parseFloat(number);
            if (highestRepeatedNumber === null || numericValue > highestRepeatedNumber) {
                highestRepeatedNumber = numericValue;
            }
        }
    });

    // Update each text object and set 'matched' if it is the highest repeated number
    flatElements.forEach((element, index) => {
        const textObject = getTextObjectByIndex(runtime, index + 1);
        if (textObject) {
            textObject.text = element.toString();
            textObject.instVars.matched = parseFloat(element) === highestRepeatedNumber;
        }
    });
}

// Helper function to get a text object by its index
function getTextObjectByIndex(runtime, index) {
    return runtime.objects.Text.getAllInstances().find(instance => instance.instVars["index"] === index);
}


function updateGlobalVariables(runtime, data) {
    runtime.globalVars.bet = data.bet;
    runtime.globalVars.beforeBalance = data.before_balance;
    runtime.globalVars.afterBalance = data.after_balance;
    runtime.globalVars.spinWin = data.spin.spin_win;
}
