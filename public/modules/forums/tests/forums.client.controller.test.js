'use strict';

(function() {
	// Forums Controller Spec
	describe('Forums Controller Tests', function() {
		// Initialize global variables
		var ForumsController,
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

			// Initialize the Forums controller.
			ForumsController = $controller('ForumsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Forum object fetched from XHR', inject(function(Forums) {
			// Create sample Forum using the Forums service
			var sampleForum = new Forums({
				name: 'New Forum'
			});

			// Create a sample Forums array that includes the new Forum
			var sampleForums = [sampleForum];

			// Set GET response
			$httpBackend.expectGET('forums').respond(sampleForums);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.forums).toEqualData(sampleForums);
		}));

		it('$scope.findOne() should create an array with one Forum object fetched from XHR using a forumId URL parameter', inject(function(Forums) {
			// Define a sample Forum object
			var sampleForum = new Forums({
				name: 'New Forum'
			});

			// Set the URL parameter
			$stateParams.forumId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/forums\/([0-9a-fA-F]{24})$/).respond(sampleForum);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.forum).toEqualData(sampleForum);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Forums) {
			// Create a sample Forum object
			var sampleForumPostData = new Forums({
				name: 'New Forum'
			});

			// Create a sample Forum response
			var sampleForumResponse = new Forums({
				_id: '525cf20451979dea2c000001',
				name: 'New Forum'
			});

			// Fixture mock form input values
			scope.name = 'New Forum';

			// Set POST response
			$httpBackend.expectPOST('forums', sampleForumPostData).respond(sampleForumResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Forum was created
			expect($location.path()).toBe('/forums/' + sampleForumResponse._id);
		}));

		it('$scope.update() should update a valid Forum', inject(function(Forums) {
			// Define a sample Forum put data
			var sampleForumPutData = new Forums({
				_id: '525cf20451979dea2c000001',
				name: 'New Forum'
			});

			// Mock Forum in scope
			scope.forum = sampleForumPutData;

			// Set PUT response
			$httpBackend.expectPUT(/forums\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/forums/' + sampleForumPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid forumId and remove the Forum from the scope', inject(function(Forums) {
			// Create new Forum object
			var sampleForum = new Forums({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Forums array and include the Forum
			scope.forums = [sampleForum];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/forums\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleForum);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.forums.length).toBe(0);
		}));
	});
}());