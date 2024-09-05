/*************************************************************
 * Main code, responsible for configuring the steps and their
 * actions.
 *
 * Author: LITW Team.
 *
 * © Copyright 2017-2024 LabintheWild.
 * For questions about this file and permission to use
 * the code, contact us at tech@labinthewild.org
 *************************************************************/

window.$ = require("jquery");
window.jQuery = window.$;
require("../js/jquery.i18n");
require("../js/jquery.i18n.messagestore");
require("jquery-ui-bundle");
let Handlebars = require("handlebars");
window.$.alpaca = require("alpaca");
window.bootstrap = require("bootstrap");
window._ = require("lodash");

//LOAD THE HTML FOR STUDY PAGES
import progressHTML from "../templates/progress.html";
Handlebars.registerPartial('prog', Handlebars.compile(progressHTML));
import loadingHTML from "../templates/loading.html";
import introHTML from "./templates/introduction.html";
import irb_LITW_HTML from "../templates/irb2-litw.html";
import quest1HTML from "./templates/question1.html";
import quest2HTML from "./templates/question2.html";
import demographicsHTML from "../templates/demographics.html";
import resultsHTML from "./templates/results.html";
import resultsFooterHTML from "../templates/results-footer.html";
import commentsHTML from "../templates/comments.html";

require("../js/litw/jspsych-display-slide");
//CONVERT HTML INTO TEMPLATES
let introTemplate = Handlebars.compile(introHTML);
let irbLITWTemplate = Handlebars.compile(irb_LITW_HTML);
let question1Template = Handlebars.compile(quest1HTML);
let question2Template = Handlebars.compile(quest2HTML);
let demographicsTemplate = Handlebars.compile(demographicsHTML);
let loadingTemplate = Handlebars.compile(loadingHTML);
let resultsTemplate = Handlebars.compile(resultsHTML);
let resultsFooterTemplate = Handlebars.compile(resultsFooterHTML);
let commentsTemplate = Handlebars.compile(commentsHTML);

//TODO: document "params.study_id" when updating the docs/7-ManageData!!!
module.exports = (function(exports) {
	const study_times= {
		SHORT: 5,
		MEDIUM: 10,
		LONG: 15,
	};
	let timeline = [];
	let params = {
		questionsAndResponses: { //DUMMY DATA - Needs to be set by questionnaire slides
			questionnaire_1: { '1': 4, '2': 2, '3': 3, '4': 5, '5': 1, '6': 5 },
			questionnaire_2: {
				responses: { '1': 5, '2': 5, '3': 3, '4': 4, '5': 1, '6': 2 },
				social_media: 'Mastodon'
			},
			questionnaire_3: { '1': 5, '2': 5 }
		},
		progressBarWidth: 0,
		numQuestions: 0,
		task_order: 1,
		questionsPerPage: [6, 6, 2],
		offset: 0,
		study_id: "38bdd732-7e05-41c0-a005-e8cc1a1a898c",
		study_recommendation: [],
		preLoad: ["../img/btn-next.png","../img/btn-next-active.png","../img/ajax-loader.gif"],
		slides: {
			INTRODUCTION: {
				name: "introduction",
				type: "display-slide",
				template: introTemplate,
				display_element: $("#intro"),
				display_next_button: false,
			},
			INFORMED_CONSENT_LITW: {
				name: "informed_consent",
				type: "display-slide",
				template: irbLITWTemplate,
				template_data: {
					time: study_times.SHORT,
				},
				display_element: $("#irb"),
				display_next_button: false,
			},
			DEMOGRAPHICS: {
				type: "display-slide",
				template: demographicsTemplate,
				template_data: {
					local_data_id: 'LITW_DEMOGRAPHICS'
				},
				display_element: $("#demographics"),
				name: "demographics",
				finish: function(){
					var dem_data = $('#demographicsForm').alpaca().getValue();
					LITW.data.addToLocal(this.template_data.local_data_id, dem_data);
					LITW.data.submitDemographics(dem_data);
				}
			},
			QUESTION1: {
				name: "questionnaire1",
				type: "display-slide",
				template: question1Template,
				template_data: () => { return getStudyQuestions(1, 6, 5, 33) },
				display_element: $("#question1"),
				display_next_button: false,
				finish: () => {}
			},
			QUESTION2: {
				name: "questionnaire2",
				type: "display-slide",
				template: question2Template,
				template_data: () => { return getStudyQuestions(2, 6, 5, 66) },
				display_element: $("#question2"),
				display_next_button: false,
				finish: () => {}
			},
			QUESTION3: {
				name: "questionnaire3",
				type: "display-slide",
				template: question1Template,
				template_data: () => { return getStudyQuestions(3, 2, 5,100) },
				display_element: $("#question3"),
				display_next_button: false
			},
			COMMENTS: {
				type: "display-slide",
				template: commentsTemplate,
				display_element: $("#comments"),
				name: "comments",
				finish: function(){
					var comments = $('#commentsForm').alpaca().getValue();
					if (Object.keys(comments).length > 0) {
						LITW.data.submitComments({
							comments: comments
						});
					}
				}
			},
			RESULTS: {
				type: "call-function",
				func: function(){
					calculateResults();
				}
			}
		}
	};

	function configureStudy() {
		params.socials = getSocialMediaPlatforms();
		timeline.push(params.slides.INTRODUCTION);
		timeline.push(params.slides.INFORMED_CONSENT_LITW);
		timeline.push(params.slides.DEMOGRAPHICS);
		timeline.push(params.slides.QUESTION1);
		timeline.push(params.slides.QUESTION2);
		timeline.push(params.slides.QUESTION3);
		timeline.push(params.slides.COMMENTS);
		timeline.push(params.slides.RESULTS);
	}

	function getSocialMediaPlatforms() {
		let array = [];
		for (let index = 0; index < 11; index++) {
			array.push($.i18n(`study-idv-col-socials${index}`));
		}
		return array;
	}

	function getStudyQuestions(questionnaire_number, num_questions, num_answers=5, completion=0) {
		let questionnaire = {
			progress: {
				value: completion
			},
			questions: [],
			responses: [],
			task_order: questionnaire_number
		}
		for(let counter_q=1; counter_q <= num_questions; counter_q++) {
			let q_code = `q${questionnaire_number}-q${counter_q}`
			questionnaire.questions.push({
				id: counter_q,
				text: $.i18n(`study-idv-col-${q_code}`)
			})
		}
		for(let counter_a=1; counter_a <= num_answers; counter_a++) {
			let a_code = `q${questionnaire_number}-r${counter_a}`
			questionnaire.responses.push({
				id: counter_a,
				text: $.i18n(`study-idv-col-${a_code}`)
			})
		}
		questionnaire.questions = shuffleArray(questionnaire.questions);
		return questionnaire;
	}

	function shuffleArray( array ) {
		return array
			.map(value => ({ value, sort: Math.random() }))
    		.sort((a, b) => a.sort - b.sort)
    		.map(({ value }) => value)
	}

	function calculateResults() {
		let results_data = {};
		let idvColScore = 0;
		let privacyScore = 0;
		let oversharingScore = 0;
		for (let idv_value of Object.values(params.questionsAndResponses.questionnaire_1)) {
			idvColScore += (idv_value);
		}
		for (let priv_value of Object.values(params.questionsAndResponses.questionnaire_2.responses)) {
			privacyScore += priv_value;
		}
		for (let sharing_value of Object.values(params.questionsAndResponses.questionnaire_1)) {
			privacyScore += sharing_value;
		}

		results_data = {
			"idvColScore": idvColScore,
			"privacyScore": privacyScore,
			"oversharingScore": oversharingScore
		}
		LITW.data.submitStudyData({results_data : results_data});
		chooseMessage(results_data);
		showResults(results_data, true)
	}

	function chooseMessage(results_data) {
		let totalPoints = 30;
		let cutoff1 = totalPoints/2;
		let totalOversharingPoints = 10;
		let cutoff2 = totalOversharingPoints/2;
		if(results_data.idvColScore < cutoff1) {
			results_data.idvColMessage = $.i18n('litw-results-idv-result');
		} else if (results_data.idvColScore > cutoff1) {
			results_data.idvColMessage = $.i18n('litw-results-col-result');
		} else {
			results_data.idvColMessage = $.i18n('litw-results-idv-col-result');
		}
		if(results_data.privacyScore < cutoff1) {
			results_data.privacyMessage = $.i18n('litw-results-low-privacy-result');
		} else if (results_data.privacyScore > cutoff1) {
			results_data.privacyMessage = $.i18n('litw-results-high-privacy-result');
		} else {
			results_data.privacyMessage = $.i18n('litw-results-med-privacy-result');
		}
		if(results_data.oversharingScore < cutoff2) {
			results_data.privacyMessage = results_data.privacyMessage + $.i18n('litw-results-low-oversharing-result');
		} else if (results_data.oversharingScore > cutoff2) {
			results_data.privacyMessage = results_data.privacyMessage + $.i18n('litw-results-high-oversharing-result');
		} else {
			results_data.privacyMessage = results_data.privacyMessage + $.i18n('litw-results-med-oversharing-result');
		}
	}

	function showResults(results = {}, showFooter = false) {
		if('PID' in params.URL) {
			//REASON: Default behavior for returning a unique PID when collecting data from other platforms
			results.code = LITW.data.getParticipantId();
		}

		$("#results").html(
			resultsTemplate({
				data: results
			}));
		if(showFooter) {
			$("#results-footer").html(resultsFooterTemplate(
				{
					share_url: window.location.href,
					share_title: $.i18n('litw-irb-header'),
					share_text: $.i18n('litw-template-title'),
					more_litw_studies: params.study_recommendation
				}
			));
		}
		$("#results").i18n();
		LITW.utils.showSlide("results");
	}

	function readSummaryData() {
		$.getJSON( "summary.json", function( data ) {
			//TODO: 'data' contains the produced summary form DB data
			//      in case the study was loaded using 'index.php'
			//SAMPLE: The example code gets the cities of study partcipants.
			console.log(data);
		});
	}

	function startStudy() {
		// generate unique participant id and geolocate participant
		LITW.data.initialize();
		// save URL params
		params.URL = LITW.utils.getParamsURL();
		if( Object.keys(params.URL).length > 0 ) {
			LITW.data.submitData(params.URL,'litw:paramsURL');
		}
		// populate study recommendation
		LITW.engage.getStudiesRecommendation(2, (studies_list) => {
			params.study_recommendation = studies_list;
		});
		// initiate pages timeline
		jsPsych.init({
		  timeline: timeline
		});
	}

	function startExperiment(){
		//TODO These methods should be something like act1().then.act2().then...
		//... it is close enough to that... maybe the translation need to be encapsulated next.
		// get initial data from database (maybe needed for the results page!?)
		//readSummaryData();

		// determine and set the study language
		$.i18n().locale = LITW.locale.getLocale();
		var languages = {
			'en': './i18n/en.json?v=1.0',
			'pt': './i18n/pt-br.json?v=1.0',
		};
		//TODO needs to be a little smarter than this when serving specific language versions, like pt-BR!
		var language = LITW.locale.getLocale().substring(0,2);
		var toLoad = {};
		if(language in languages) {
			toLoad[language] = languages[language];
		} else {
			toLoad['en'] = languages['en'];
		}
		$.i18n().load(toLoad).done(
			function() {
				$('head').i18n();
				$('body').i18n();

				LITW.utils.showSlide("img-loading");
				//start the study when resources are preloaded
				jsPsych.pluginAPI.preloadImages(params.preLoad,
					function () {
						configureStudy();
						startStudy();
					},

					// update loading indicator
					function (numLoaded) {
						$("#img-loading").html(loadingTemplate({
							msg: $.i18n("litw-template-loading"),
							numLoaded: numLoaded,
							total: params.preLoad.length
						}));
					}
				);
			});
	}



	// when the page is loaded, start the study!
	$(document).ready(function() {
		startExperiment();
	});
	exports.study = {};
	exports.study.params = params

})( window.LITW = window.LITW || {} );
