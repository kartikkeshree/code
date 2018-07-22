'use strict';

(function() {
	// Dentists Controller Spec
	describe('Dentists Controller Tests', function() {
		// Initialize global variables
		var DentistsController,
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

			// Initialize the Dentists controller.
			DentistsController = $controller('DentistsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Dentist object fetched from XHR', inject(function(Dentists) {
			// Create sample Dentist using the Dentists service
			var sampleDentist = new Dentists({
				name: 'New Dentist'
			});

			// Create a sample Dentists array that includes the new Dentist
			var sampleDentists = [sampleDentist];

			// Set GET response
			$httpBackend.expectGET('dentists').respond(sampleDentists);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.dentists).toEqualData(sampleDentists);
		}));

		it('$scope.findOne() should create an array with one Dentist object fetched from XHR using a dentistId URL parameter', inject(function(Dentists) {
			// Define a sample Dentist object
			var sampleDentist = new Dentists({
				name: 'New Dentist'
			});

			// Set the URL parameter
			$stateParams.dentistId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/dentists\/([0-9a-fA-F]{24})$/).respond(sampleDentist);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.dentist).toEqualData(sampleDentist);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Dentists) {
			// Create a sample Dentist object
			var sampleDentistPostData = new Dentists({
				name: 'New Dentist'
			});

			// Create a sample Dentist response
			var sampleDentistResponse = new Dentists({
				_id: '525cf20451979dea2c000001',
				name: 'New Dentist'
			});

			// Fixture mock form input values
			scope.name = 'New Dentist';

			// Set POST response
			$httpBackend.expectPOST('dentists', sampleDentistPostData).respond(sampleDentistResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Dentist was created
			expect($location.path()).toBe('/dentists/' + sampleDentistResponse._id);
		}));

		it('$scope.update() should update a valid Dentist', inject(function(Dentists) {
			// Define a sample Dentist put data
			var sampleDentistPutData = new Dentists({
				_id: '525cf20451979dea2c000001',
				name: 'New Dentist'
			});

			// Mock Dentist in scope
			scope.dentist = sampleDentistPutData;

			// Set PUT response
			$httpBackend.expectPUT(/dentists\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/dentists/' + sampleDentistPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid dentistId and remove the Dentist from the scope', inject(function(Dentists) {
			// Create new Dentist object
			var sampleDentist = new Dentists({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Dentists array and include the Dentist
			scope.dentists = [sampleDentist];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/dentists\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleDentist);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.dentists.length).toBe(0);
		}));
	});
}());