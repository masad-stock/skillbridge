import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Alert, Modal, Form, InputGroup, Dropdown, Pagination, Spinner, ProgressBar } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaPhone, FaEnvelope, FaMapMarkerAlt, FaShoppingCart, FaStar, FaUserTag } from 'react-icons/fa';
import { useBusiness } from '../context/BusinessContext';

function CustomerManagement() {
    const { state, actions } = useBusiness();
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [formData, setFormData] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [segmentFilter, setSegmentFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
