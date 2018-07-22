'use strict';

(function() {
	// Appointments Controller Spec
	describe('Appointments Controller Tests', function() {
		// Initialize global variables
		var AppointmentsController,
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

			// Initialize the Appointments controller.
			AppointmentsController = $controller('AppointmentsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Appointment object fetched from XHR', inject(function(Appointments) {
			// Create sample Appointment using the Appointments service
			var sampleAppointment = new Appointments({
				name: 'New Appointment'
			});

			// Create a sample Appointments array that includes the new Appointment
			var sampleAppointments = [sampleAppointment];

			// Set GET response
			$httpBackend.expectGET('appointments').respond(sampleAppointments);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.appointments).toEqualData(sampleAppointments);
		}));

		it('$scope.findOne() should create an array with one Appointment object fetched from XHR using a appointmentId URL parameter', inject(function(Appointments) {
			// Define a sample Appointment object
			var sampleAppointment = new Appointments({
				name: 'New Appointment'
			});

			// Set the URL parameter
			$stateParams.appointmentId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/appointments\/([0-9a-fA-F]{24})$/).respond(sampleAppointment);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.appointment).toEqualData(sampleAppointment);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Appointments) {
			// Create a sample Appointment object
			var sampleAppointmentPostData = new Appointments({
				name: 'New Appointment'
			});

			// Create a sample Appointment response
			var sampleAppointmentResponse = new Appointments({
				_id: '525cf20451979dea2c000001',
				name: 'New Appointment'
			});

			// Fixture mock form input values
			scope.name = 'New Appointment';

			// Set POST response
			$httpBackend.expectPOST('appointments', sampleAppointmentPostData).respond(sampleAppointmentResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Appointment was created
			expect($location.path()).toBe('/appointments/' + sampleAppointmentResponse._id);
		}));

		it('$scope.update() should update a valid Appointment', inject(function(Appointments) {
			// Define a sample Appointment put data
			var sampleAppointmentPutData = new Appointments({
				_id: '525cf20451979dea2c000001',
				name: 'New Appointment'
			});

			// Mock Appointment in scope
			scope.appointment = sampleAppointmentPutData;

			// Set PUT response
			$httpBackend.expectPUT(/appointments\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/appointments/' + sampleAppointmentPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid appointmentId and remove the Appointment from the scope', inject(function(Appointments) {
			// Create new Appointment object
			var sampleAppointment = new Appointments({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Appointments array and include the Appointment
			scope.appointments = [sampleAppointment];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/appointments\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleAppointment);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.appointments.length).toBe(0);
		}));
	});
}());