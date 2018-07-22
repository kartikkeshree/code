'use strict';

(function() {
	// Knowledgebases Controller Spec
	describe('Knowledgebases Controller Tests', function() {
		// Initialize global variables
		var KnowledgebasesController,
		scope,
		$httpBackend,
		$stateParams,
		$location;

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
		beforeEach(function() {
			jasmine.addMatchers({
				toEqualData: function(util, customEqualityTesters) {
					return {
						compare: function(actual, expected) {
							return {
								pass: angular.equals(actual, expected)
							};
						}
					};
				}
			});
		});

		// Then we can start by loading the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;

			// Initialize the Knowledgebases controller.
			KnowledgebasesController = $controller('KnowledgebasesController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Knowledgebase object fetched from XHR', inject(function(Knowledgebases) {
			// Create sample Knowledgebase using the Knowledgebases service
			var sampleKnowledgebase = new Knowledgebases({
				name: 'New Knowledgebase'
			});

			// Create a sample Knowledgebases array that includes the new Knowledgebase
			var sampleKnowledgebases = [sampleKnowledgebase];

			// Set GET response
			$httpBackend.expectGET('knowledgebases').respond(sampleKnowledgebases);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.knowledgebases).toEqualData(sampleKnowledgebases);
		}));

		it('$scope.findOne() should create an array with one Knowledgebase object fetched from XHR using a knowledgebaseId URL parameter', inject(function(Knowledgebases) {
			// Define a sample Knowledgebase object
			var sampleKnowledgebase = new Knowledgebases({
				name: 'New Knowledgebase'
			});

			// Set the URL parameter
			$stateParams.knowledgebaseId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/knowledgebases\/([0-9a-fA-F]{24})$/).respond(sampleKnowledgebase);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.knowledgebase).toEqualData(sampleKnowledgebase);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Knowledgebases) {
			// Create a sample Knowledgebase object
			var sampleKnowledgebasePostData = new Knowledgebases({
				name: 'New Knowledgebase'
			});

			// Create a sample Knowledgebase response
			var sampleKnowledgebaseResponse = new Knowledgebases({
				_id: '525cf20451979dea2c000001',
				name: 'New Knowledgebase'
			});

			// Fixture mock form input values
			scope.name = 'New Knowledgebase';

			// Set POST response
			$httpBackend.expectPOST('knowledgebases', sampleKnowledgebasePostData).respond(sampleKnowledgebaseResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Knowledgebase was created
			expect($location.path()).toBe('/knowledgebases/' + sampleKnowledgebaseResponse._id);
		}));

		it('$scope.update() should update a valid Knowledgebase', inject(function(Knowledgebases) {
			// Define a sample Knowledgebase put data
			var sampleKnowledgebasePutData = new Knowledgebases({
				_id: '525cf20451979dea2c000001',
				name: 'New Knowledgebase'
			});

			// Mock Knowledgebase in scope
			scope.knowledgebase = sampleKnowledgebasePutData;

			// Set PUT response
			$httpBackend.expectPUT(/knowledgebases\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/knowledgebases/' + sampleKnowledgebasePutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid knowledgebaseId and remove the Knowledgebase from the scope', inject(function(Knowledgebases) {
			// Create new Knowledgebase object
			var sampleKnowledgebase = new Knowledgebases({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Knowledgebases array and include the Knowledgebase
			scope.knowledgebases = [sampleKnowledgebase];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/knowledgebases\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleKnowledgebase);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.knowledgebases.length).toBe(0);
		}));
	});
}());