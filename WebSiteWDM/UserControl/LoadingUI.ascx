<%@ Control Language="C#" AutoEventWireup="true" CodeFile="LoadingUI.ascx.cs" Inherits="UserControl_LoadingUI" %>
<style type="text/css">
    #loadingUI {
        position: fixed;
        z-index: 1000;
        width: 100%;
        height: 100%;
        top: 0px;
        left: 0px;
        background-color: rgba(0, 0, 0, .075);
        display: none;
        cursor: wait;
    }

    #loading-msg {
        max-width: 320px;
        margin: auto;
        font-size: 16px;
    }

    .loadingui-close {
        cursor: pointer;
    }

        .loadingui-close:hover {
            font-weight: bold;
        }

    .warpper-loading {
        margin: auto;
        background-color: #fff;
        color: black;
        padding: 10px;
        border-radius: 5px;
        width: 330px;
        height: 135px;
    }

    .icon-close {
        float: right;
        top: -6px;
        position: relative;
    }

    .icon-close:hover{
        cursor: pointer
    }

    .icon-loading {
        font-size: 30px;
        margin-top: 30px;
    }
</style>

<div id="loadingUI">
    <table style="width: 100%; height: 100%; text-align: center; vertical-align: middle">
        <tr>
            <td>
                <div class="warpper-loading">
                    <div class="icon-close">
                        <i class="fas fa-window-close" onclick="loadingUI.Close();"></i>
                    </div>
                    <div style="margin-top: 20px">
                        <p id="loading-msg" style="height: 10px;">
                        </p>
                        <p class="icon-loading"><i class="fas fa-spinner fa-spin"></i></p>
                    </div>

                </div>
            </td>
        </tr>
    </table>
</div>

<script type="text/javascript">
    function LoadingUI(msg) {
        var gui = {
            Sender: "#loadingUI",
            Mesg: "#loading-msg",
            lblButton: "#lblButton"
        }
        this.Open = function (msg, lblButton) {
            $(gui.Sender).css('display', 'block');

            msg = msg == undefined ? "Please Wait..." : msg;
            if (lblButton == undefined || lblButton == '')
                lblButton = 'Cancel';

            $(gui.Mesg).html(msg);
            $(gui.lblButton).html(lblButton);
        }
        this.Close = function () { $(gui.Sender).css('display', 'none'); }
    }
    var loadingUI = new LoadingUI();
</script>
