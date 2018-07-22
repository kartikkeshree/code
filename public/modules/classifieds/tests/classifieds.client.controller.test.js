'use strict';

(function() {
	// Classifieds Controller Spec
	describe('Classifieds Controller Tests', function() {
		// Initialize global variables
		var ClassifiedsController,
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

			// Initialize the Classifieds controller.
			ClassifiedsController = $controller('ClassifiedsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Classified object fetched from XHR', inject(function(Classifieds) {
			// Create sample Classified using the Classifieds service
			var sampleClassified = new Classifieds({
				name: 'New Classified'
			});

			// Create a sample Classifieds array that includes the new Classified
			var sampleClassifieds = [sampleClassified];

			// Set GET response
			$httpBackend.expectGET('classifieds').respond(sampleClassifieds);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.classifieds).toEqualData(sampleClassifieds);
		}));

		it('$scope.findOne() should create an array with one Classified object fetched from XHR using a classifiedId URL parameter', inject(function(Classifieds) {
			// Define a sample Classified object
			var sampleClassified = new Classifieds({
				name: 'New Classified'
			});

			// Set the URL parameter
			$stateParams.classifiedId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/classifieds\/([0-9a-fA-F]{24})$/).respond(sampleClassified);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.classified).toEqualData(sampleClassified);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Classifieds) {
			// Create a sample Classified object
			var sampleClassifiedPostData = new Classifieds({
				name: 'New Classified'
			});

			// Create a sample Classified response
			var sampleClassifiedResponse = new Classifieds({
				_id: '525cf20451979dea2c000001',
				name: 'New Classified'
			});

			// Fixture mock form input values
			scope.name = 'New Classified';

			// Set POST response
			$httpBackend.expectPOST('classifieds', sampleClassifiedPostData).respond(sampleClassifiedResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Classified was created
			expect($location.path()).toBe('/classifieds/' + sampleClassifiedResponse._id);
		}));

		it('$scope.update() should update a valid Classified', inject(function(Classifieds) {
			// Define a sample Classified put data
			var sampleClassifiedPutData = new Classifieds({
				_id: '525cf20451979dea2c000001',
				name: 'New Classified'
			});

			// Mock Classified in scope
			scope.classified = sampleClassifiedPutData;

			// Set PUT response
			$httpBackend.expectPUT(/classifieds\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/classifieds/' + sampleClassifiedPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid classifiedId and remove the Classified from the scope', inject(function(Classifieds) {
			// Create new Classified object
			var sampleClassified = new Classifieds({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Classifieds array and include the Classified
			scope.classifieds = [sampleClassified];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/classifieds\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleClassified);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.classifieds.length).toBe(0);
		}));
	});
}());