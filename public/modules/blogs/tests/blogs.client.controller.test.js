'use strict';

(function() {
	// Blogs Controller Spec
	describe('Blogs Controller Tests', function() {
		// Initialize global variables
		var BlogsController,
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

			// Initialize the Blogs controller.
			BlogsController = $controller('BlogsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Blog object fetched from XHR', inject(function(Blogs) {
			// Create sample Blog using the Blogs service
			var sampleBlog = new Blogs({
				name: 'New Blog'
			});

			// Create a sample Blogs array that includes the new Blog
			var sampleBlogs = [sampleBlog];

			// Set GET response
			$httpBackend.expectGET('blogs').respond(sampleBlogs);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.blogs).toEqualData(sampleBlogs);
		}));

		it('$scope.findOne() should create an array with one Blog object fetched from XHR using a blogId URL parameter', inject(function(Blogs) {
			// Define a sample Blog object
			var sampleBlog = new Blogs({
				name: 'New Blog'
			});

			// Set the URL parameter
			$stateParams.blogId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/blogs\/([0-9a-fA-F]{24})$/).respond(sampleBlog);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.blog).toEqualData(sampleBlog);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Blogs) {
			// Create a sample Blog object
			var sampleBlogPostData = new Blogs({
				name: 'New Blog'
			});

			// Create a sample Blog response
			var sampleBlogResponse = new Blogs({
				_id: '525cf20451979dea2c000001',
				name: 'New Blog'
			});

			// Fixture mock form input values
			scope.name = 'New Blog';

			// Set POST response
			$httpBackend.expectPOST('blogs', sampleBlogPostData).respond(sampleBlogResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Blog was created
			expect($location.path()).toBe('/blogs/' + sampleBlogResponse._id);
		}));

		it('$scope.update() should update a valid Blog', inject(function(Blogs) {
			// Define a sample Blog put data
			var sampleBlogPutData = new Blogs({
				_id: '525cf20451979dea2c000001',
				name: 'New Blog'
			});

			// Mock Blog in scope
			scope.blog = sampleBlogPutData;

			// Set PUT response
			$httpBackend.expectPUT(/blogs\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/blogs/' + sampleBlogPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid blogId and remove the Blog from the scope', inject(function(Blogs) {
			// Create new Blog object
			var sampleBlog = new Blogs({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Blogs array and include the Blog
			scope.blogs = [sampleBlog];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/blogs\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleBlog);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.blogs.length).toBe(0);
		}));
	});
}());