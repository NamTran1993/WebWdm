var app = angular.module('app', []);
var scope = null;
var url = '../Ajax/BatchLogData.ashx';

app.controller('mornitorController', function ($scope) {
    console.log('mornitorController');

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
    $scope.arrayBatchLog = [];

    $scope.search = function () {
        console.log('search');

        let jsonReq = {};

        $.ajax({
            type: "POST",
            url: url + "?func=SEARCH-LOG",
            data: jsonReq,

            beforeSend: function () {
                loadingUI.Open();
            },

            success: function (jsonRes) {
                try {
                    $scope.arrayBatchLog = JSON.parse(jsonRes);
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