var app = angular.module('app', []);
var scope = null;
var url = '../Ajax/SettingsData.ashx';

app.controller('settingsController', function ($scope) {
    console.log('settingsController');

    this.scope = $scope;

    $scope.applyDelay = null;
    $scope.updateUI = function () {
        try {
            if ($scope.applyDelay !== null) {
                clearTimeout($scope.applyDelay);
            }

            $scope.applyDelay = setTimeout(function () {
                $scope.$apply();
                loadingUI.Close();
            }, 500);
        }
        catch (e) {
            console.log('$scope.applyDelay Exception:');
        }
    };

    // ----------#-----------
    $scope.pageIndex = 1;
    $scope.recordPerPage = 1000;
    $scope.dbSettings = [];

    $scope.search = function () {
        console.log('search');

        let jsonReq = {};

        $.ajax({
            type: "POST",
            url: url + "?func=DB-SETTINGS",
            data: jsonReq,

            beforeSend: function () {
                loadingUI.Open();
            },

            success: function (jsonRes) {
                try {
                    $scope.dbSettings = JSON.parse(jsonRes);
                    $scope.updateUI();

                } catch (e) {
                    loadingUI.Close();
                    console.error('=>> ERROR: ' + e);
                }
            },

            error: function (xhr, textStatus, error) {
                loadingUI.Close();
            }
        });
    };

    $scope.searchDetail = function (levelLog, info) {
        console.info('LEVEL LOG: ' + levelLog + ' INFO: ' + JSON.stringify(info));

    };

    setTimeout($scope.search, 500);
});