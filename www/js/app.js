// Ionic Starter App

// Controllers
const TodoCtrl = function(
  $scope,
  $http,
  $ionicModal,
  $state,
  $ionicSideMenuDelegate
) {
  // Create and load the Modal
  $ionicModal.fromTemplateUrl(
    'new-task.html',
    function(modal) {
      $scope.taskModal = modal;
    },
    {
      scope: $scope,
      animation: 'slide-in-up'
    }
  );

  $scope.projects = [];
  $scope.list = [];
  $scope.task = {};

  const getFilteredTodos = () => {
    $scope.filteredList = $scope.list.filter(x => {
      return x.category === $scope.activeProject;
    });
  };

  const getTodos = () => {
    $http
      .get('/api/list')
      .then(data => {
        $scope.list = data.data;
        getFilteredTodos();
      })
      .catch(data => {
        console.log('Error: ' + data);
      });
  };

  const getProjects = () => {
    $http
      .get('/api/lists')
      .then(data => {
        $scope.projects = data.data;
      })
      .catch(err => {
        console.log(err);
      });
  };

  const createProject = projectTitle => {
    $http
      .post('/api/lists/' + projectTitle)
      .then(() => {
        getProjects();
        // $scope.selectProject(newProject, $scope.projects.length - 1);
      })
      .catch(err => {
        console.log(err);
      });
  };

  $scope.newProject = () => {
    const projectTitle = prompt('Project name');
    if (projectTitle) {
      createProject(projectTitle);
    }
  };

  $scope.selectProject = project => {
    $scope.activeProject = project;
    getTodos();
    $ionicSideMenuDelegate.toggleLeft(false);
  };

  // Called when the form is submitted
  $scope.createTask = function(task) {
    if (!$scope.activeProject || !task) {
      return;
    }
    $http
      .post('/api/list', { todo: task.todo, category: $scope.activeProject })
      .then(data => {
        $scope.task.todo = '';
        $scope.list = data.data;
        getFilteredTodos();
      })
      .catch(data => {
        console.log('Error: ' + data);
      });
    $scope.taskModal.hide();
  };

  // Open our new task modal
  $scope.newTask = function() {
    $scope.taskModal.show();
  };

  // Close the new task modal
  $scope.closeNewTask = function() {
    $scope.taskModal.hide();
  };

  $scope.toggleProjects = () => {
    $ionicSideMenuDelegate.toggleLeft();
  };

  $scope.deleteTask = id => {
    $http
      .delete('/api/list/' + id)
      .then(() => {
        getTodos();
      })
      .catch(err => {
        console.log(err);
      });
  };

  $scope.disconnect = () => {
    $http
      .get('/logout')
      .then(() => {
        $state.go('login');
      })
      .catch(err => {
        console.log(err);
      });
  };

  getProjects();
};

const LoginCtrl = function($scope, $state, $http, $ionicPopup) {
  $scope.credentials = {};

  $scope.login = () => {
    $http
      .post('/login', $scope.credentials)
      .then(data => {
        if (data.data.status === 401 || data.data === false) {
          $ionicPopup.alert({
            title: 'Identifiant ou mot de passe erroné',
            template: 'Veuillez verifier vos informations !'
          });
          $state.go('login');
        } else $state.go('todo');
      })
      .catch(err => {
        console.log(err);
      });
  };

  $scope.signup = () => {
    $state.go('signup');
  };
};

const SignupCtrl = function($scope, $state, $http, $ionicPopup) {
  $scope.credentials = {};
  $scope.signup = conf => {
    if ($scope.credentials.password === conf) {
      $http
        .post('/signup', $scope.credentials)
        .then(data => {
          console.log(data);
          if (data.status === 200) $state.go('login');
          $ionicPopup.alert({
            title: 'Vous êtes inscrit',
            template: 'Veuillez vous connecter !'
          });
        })
        .catch(err => {
          console.log(err);
        });
    } else {
      $ionicPopup.alert({
        title: 'Les mots de passes sont différents',
        template: 'Veuillez verifier vos informations !'
      });
    }
  };

  $scope.back = () => {
    $state.go('login');
  };
};
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular
  .module('todo', ['ionic'])
  .controller('TodoCtrl', TodoCtrl)
  .controller('LoginCtrl', LoginCtrl)
  .controller('SignupCtrl', SignupCtrl)
  .config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('login', {
        url: '/login',
        templateUrl: 'templates/login.html',
        cache: false,
        controller: 'LoginCtrl'
      })
      .state('todo', {
        url: '/todos',
        templateUrl: 'templates/todos.html',
        cache: false,
        controller: 'TodoCtrl'
      })
      .state('signup', {
        url: '/signup',
        templateUrl: 'templates/signup.html',
        controller: 'SignupCtrl'
      });
    $urlRouterProvider.otherwise('/login');
  })

  .run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs).
      // The reason we default this to hidden is that native apps don't usually show an accessory bar, at
      // least on iOS. It's a dead giveaway that an app is using a Web View. However, it's sometimes
      // useful especially with forms, though we would prefer giving the user a little more room
      // to interact with the app.
      if (window.cordova && window.Keyboard) {
        window.Keyboard.hideKeyboardAccessoryBar(true);
      }

      if (window.StatusBar) {
        // Set the statusbar to use the default style, tweak this to
        // remove the status bar on iOS or change it to use white instead of dark colors.
        StatusBar.styleDefault();
      }
    });
  });
