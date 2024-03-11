<%@ Page Title="" Language="C#" MasterPageFile="~/MasterPage.master" AutoEventWireup="true" CodeFile="MakeBillGmo.aspx.cs" Inherits="GUI_MakeBillGmo" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="Server">
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceBody" runat="Server">
    <div class="page-MakeBillGmo" data-ng-app="app">
        <div data-ng-controller="makebillController">
            <div class="usedMonthlyLow">
                <div>
                    <p class="tille-1">Thêm dữ liệu trong bảng: t_used_kwh_monthly_l</p>
                    <div class="div-input">
                        <table id="t_used_kwh_monthly_l" class="table">
                            <tr>
                                <td>
                                    <p>
                                        feed_point_no
                                    </p>
                                </td>

                                <td>
                                    <div class="input-group">
                                        <input type="text" id="feed_point_no" class="input-group" data-ng-model="feed_point_no"/>
                                    </div>

                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <p>
                                        area
                                    </p>
                                </td>

                                <td>
                                    <div class="input-group">
                                        <input type="text" id="area" class="input-group" data-ng-model="area"/>
                                    </div>
                                </td>
                            </tr>

                            <tr>
                                <td>
                                    <p>
                                        ngày/giờ
                                    </p>
                                </td>

                                <td>
                                    <div class="input-group">
                                        <input disabled type="text" id="date-time" class="input-group" data-ng-model="datetime | date : 'yyyy/MM/dd HH:hh:ss'"/>
                                    </div>
                                </td>
                            </tr>

                            <tr>
                                <td colspan="2">
                                    <div class="div-Button">
                                        <input type="button" value="Thêm" class="button-1" data-ng-click="add()" />
                                    </div>
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</asp:Content>

<asp:Content ID="Content3" ContentPlaceHolderID="ContentPlaceBodyFooter" runat="Server">
     <script src="<%=ResolveUrl("~/Scripts/makebillPage.js?ver=1.0.0.0")%>"></script>
</asp:Content>

