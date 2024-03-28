<%@ Page Title="" Language="C#" MasterPageFile="~/MasterPage.master" AutoEventWireup="true" CodeFile="index.aspx.cs" Inherits="GUI_Home" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="Server">
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceBody" runat="Server">
    <p class="main-img"></p>
</asp:Content>

<asp:Content ID="Content3" ContentPlaceHolderID="ContentPlaceBodyFooter" runat="Server">
     <script src="<%=ResolveUrl("~/Scripts/makebillPage.js?ver=1.0.0.0")%>"></script>
</asp:Content>