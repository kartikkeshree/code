'use strict';

(function() {
	// Clinics Controller Spec
	describe('Clinics Controller Tests', function() {
		// Initialize global variables
		var ClinicsController,
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

			// Initialize the Clinics controller.
			ClinicsController = $controller('ClinicsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Clinic object fetched from XHR', inject(function(Clinics) {
			// Create sample Clinic using the Clinics service
			var sampleClinic = new Clinics({
				name: 'New Clinic'
			});

			// Create a sample Clinics array that includes the new Clinic
			var sampleClinics = [sampleClinic];

			// Set GET response
			$httpBackend.expectGET('clinics').respond(sampleClinics);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.clinics).toEqualData(sampleClinics);
		}));

		it('$scope.findOne() should create an array with one Clinic object fetched from XHR using a clinicId URL parameter', inject(function(Clinics) {
			// Define a sample Clinic object
			var sampleClinic = new Clinics({
				name: 'New Clinic'
			});

			// Set the URL parameter
			$stateParams.clinicId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/clinics\/([0-9a-fA-F]{24})$/).respond(sampleClinic);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.clinic).toEqualData(sampleClinic);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Clinics) {
			// Create a sample Clinic object
			var sampleClinicPostData = new Clinics({
				name: 'New Clinic'
			});

			// Create a sample Clinic response
			var sampleClinicResponse = new Clinics({
				_id: '525cf20451979dea2c000001',
				name: 'New Clinic'
			});

			// Fixture mock form input values
			scope.name = 'New Clinic';

			// Set POST response
			$httpBackend.expectPOST('clinics', sampleClinicPostData).respond(sampleClinicResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Clinic was created
			expect($location.path()).toBe('/clinics/' + sampleClinicResponse._id);
		}));

		it('$scope.update() should update a valid Clinic', inject(function(Clinics) {
			// Define a sample Clinic put data
			var sampleClinicPutData = new Clinics({
				_id: '525cf20451979dea2c000001',
				name: 'New Clinic'
			});

			// Mock Clinic in scope
			scope.clinic = sampleClinicPutData;

			// Set PUT response
			$httpBackend.expectPUT(/clinics\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/clinics/' + sampleClinicPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid clinicId and remove the Clinic from the scope', inject(function(Clinics) {
			// Create new Clinic object
			var sampleClinic = new Clinics({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Clinics array and include the Clinic
			scope.clinics = [sampleClinic];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/clinics\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleClinic);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.clinics.length).toBe(0);
		}));
	});
}());