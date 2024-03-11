var app = angular.module('app', []);
var scope = null;
var url = '../Ajax/UsedMonthlyLow.ashx';

app.controller('makebillController', function ($scope) {
    console.log('makebillController');

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
    $scope.feed_point_no = '';
    $scope.area = '';
    $scope.datetime = '';

    $scope.add = function () {
        console.log('add');

        let jsonReq = {
            feed_point_no: $scope.feed_point_no,
            area: $scope.area
        };

        $.ajax({
            type: "POST",
            url: url + "?func=ADD",
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

    // ---
    let now = new Date();
    $scope.datetime = now.toISOString();
});